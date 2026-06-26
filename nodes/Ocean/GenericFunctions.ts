import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

type OceanHttpError = {
	response?: {
		body?: IDataObject;
	};
};

type ValidationErrorDetail = {
	loc?: Array<string | number>;
	msg?: string;
};

/**
 * Make an API request to Ocean.io
 */
export async function oceanApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		body,
		qs,
		url: `https://api.ocean.io${endpoint}`,
		json: true,
	};

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'oceanApi',
			options,
		)) as IDataObject;
	} catch (error: unknown) {
		const err = error as OceanHttpError;
		if (err.response?.body) {
			const errorBody = err.response.body;

			if (errorBody.detail) {
				if (typeof errorBody.detail === 'string') {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: `Ocean.io API Error: ${errorBody.detail}`,
						description: getErrorDescription(errorBody.detail),
					});
				}

				if (Array.isArray(errorBody.detail)) {
					const validationErrors = (errorBody.detail as ValidationErrorDetail[])
						.map((detail) => `${detail.loc?.join('.') || 'field'}: ${detail.msg}`)
						.join(', ');

					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: `Ocean.io Validation Error: ${validationErrors}`,
					});
				}
			}
		}

		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Get user-friendly error descriptions for common Ocean.io API errors
 */
function getErrorDescription(errorDetail: string): string {
	const errorMap: Record<string, string> = {
		'Insufficient standard credits':
			"You don't have enough standard credits. Check your credit balance or upgrade your Ocean.io plan.",
		'Insufficient email credits':
			"You don't have enough email credits for email reveal operations.",
		'Insufficient phone credits':
			"You don't have enough phone credits for phone reveal operations.",
		'API token should be provided in headers or query parameters':
			'Invalid or missing API key. Please check your Ocean.io API credentials.',
		'Current API token is not registered in our database':
			'Invalid API key. Please verify your Ocean.io API key in your account settings.',
		'Conflicting API tokens provided in query parameters and headers':
			'API token conflict. Please contact support if this persists.',
	};

	return errorMap[errorDetail] || 'Please check the Ocean.io API documentation for more details.';
}

/**
 * Handle pagination for Ocean.io API responses
 */
export async function oceanApiRequestAllItems(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	let allItems: IDataObject[] = [];
	let hasMore = true;
	let pageCount = 0;
	const maxPages = 100;

	const requestBody = { ...body };
	if (!requestBody.size) {
		requestBody.size = 100;
	}

	while (hasMore && pageCount < maxPages) {
		pageCount++;

		const response = await oceanApiRequest.call(this, method, endpoint, requestBody, qs);

		let items: IDataObject[] = [];
		if (Array.isArray(response.companies)) {
			items = response.companies as IDataObject[];
		} else if (Array.isArray(response.people)) {
			items = response.people as IDataObject[];
		} else if (Array.isArray(response.items)) {
			items = response.items as IDataObject[];
		} else if (Array.isArray(response)) {
			items = response as IDataObject[];
		}

		if (items.length > 0) {
			allItems = allItems.concat(items);
		}

		if (response.searchAfter && items.length > 0) {
			requestBody.searchAfter = response.searchAfter;
		} else {
			hasMore = false;
		}

		if (items.length < (requestBody.size as number)) {
			hasMore = false;
		}
	}

	if (pageCount >= maxPages) {
		throw new NodeOperationError(
			this.getNode(),
			`Pagination stopped after ${maxPages} pages to prevent infinite loops. Consider using filters to reduce result set.`,
		);
	}

	return allItems;
}

/**
 * Format date for Ocean.io API (YYYY-MM-DD format)
 */
export function formatDateForOceanApi(dateInput: unknown): string {
	if (!dateInput || dateInput === '') {
		return '';
	}

	let dateString = String(dateInput);

	if (dateString.startsWith('[DateTime: ') && dateString.endsWith(']')) {
		dateString = dateString.slice(11, -1);
	}

	if (dateString.includes('T')) {
		dateString = dateString.split('T')[0];
	}

	if (dateString.includes(' ')) {
		dateString = dateString.split(' ')[0];
	}

	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(dateString)) {
		try {
			const parsedDate = new Date(dateInput as string | number | Date);
			if (!isNaN(parsedDate.getTime())) {
				const year = parsedDate.getFullYear();
				const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
				const day = String(parsedDate.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			}
		} catch {
			return '';
		}
	}

	return dateString;
}

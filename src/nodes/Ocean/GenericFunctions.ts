import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestMethods,
	IRequestOptions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

/**
 * Make an API request to Ocean.io
 */
export async function oceanApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const options: IRequestOptions = {
		method,
		body,
		qs,
		url: `https://api.ocean.io${endpoint}`,
		json: true,
	};

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'oceanApi', options);
	} catch (error) {
		// Handle Ocean.io specific errors
		if (error.response?.body) {
			const errorBody = error.response.body;
			
			// Handle common Ocean.io API errors
			if (errorBody.detail) {
				if (typeof errorBody.detail === 'string') {
					throw new NodeApiError(this.getNode(), error, {
						message: `Ocean.io API Error: ${errorBody.detail}`,
						description: getErrorDescription(errorBody.detail),
					});
				}
				
				// Handle validation errors
				if (Array.isArray(errorBody.detail)) {
					const validationErrors = errorBody.detail.map((err: any) => 
						`${err.loc?.join('.') || 'field'}: ${err.msg}`
					).join(', ');
					
					throw new NodeApiError(this.getNode(), error, {
						message: `Ocean.io Validation Error: ${validationErrors}`,
					});
				}
			}
		}
		
		throw new NodeApiError(this.getNode(), error);
	}
}

/**
 * Get user-friendly error descriptions for common Ocean.io API errors
 */
function getErrorDescription(errorDetail: string): string {
	const errorMap: { [key: string]: string } = {
		'Insufficient standard credits': 'You don\'t have enough standard credits. Check your credit balance or upgrade your Ocean.io plan.',
		'Insufficient email credits': 'You don\'t have enough email credits for email reveal operations.',
		'Insufficient phone credits': 'You don\'t have enough phone credits for phone reveal operations.',
		'API token should be provided in headers or query parameters': 'Invalid or missing API key. Please check your Ocean.io API credentials.',
		'Current API token is not registered in our database': 'Invalid API key. Please verify your Ocean.io API key in your account settings.',
		'Conflicting API tokens provided in query parameters and headers': 'API token conflict. Please contact support if this persists.',
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
): Promise<any[]> {
	let allItems: any[] = [];
	let hasMore = true;
	let pageCount = 0;
	const maxPages = 100; // Safety limit

	// Set initial pagination parameters
	const requestBody = { ...body };
	if (!requestBody.size) {
		requestBody.size = 100; // Use maximum page size for efficiency
	}

	while (hasMore && pageCount < maxPages) {
		pageCount++;
		
		const response = await oceanApiRequest.call(this, method, endpoint, requestBody, qs);
		
		// Handle different response structures
		let items: any[] = [];
		if (response.companies && Array.isArray(response.companies)) {
			items = response.companies;
		} else if (response.people && Array.isArray(response.people)) {
			items = response.people;
		} else if (response.items && Array.isArray(response.items)) {
			items = response.items;
		} else if (Array.isArray(response)) {
			items = response;
		}

		if (items.length > 0) {
			allItems = allItems.concat(items);
		}

		// Check for more pages using searchAfter token
		if (response.searchAfter && items.length > 0) {
			requestBody.searchAfter = response.searchAfter;
		} else {
			hasMore = false;
		}

		// Safety check - if we get less than requested size, probably no more pages
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
export function formatDateForOceanApi(dateInput: any): string {
	if (!dateInput || dateInput === '') {
		return '';
	}

	let dateString = String(dateInput);

	// Handle n8n DateTime objects that come as "[DateTime: 2025-06-26T13:52:08.271Z]"
	if (dateString.startsWith('[DateTime: ') && dateString.endsWith(']')) {
		dateString = dateString.slice(11, -1); // Remove "[DateTime: " and "]"
	}

	// Handle ISO datetime strings (e.g., "2025-06-19T13:52:45.316Z")
	if (dateString.includes('T')) {
		dateString = dateString.split('T')[0];
	}

	// Handle date strings that might have time components separated by space
	if (dateString.includes(' ')) {
		dateString = dateString.split(' ')[0];
	}

	// Validate the resulting date format (should be YYYY-MM-DD)
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(dateString)) {
		// Try to parse as Date and format
		try {
			const parsedDate = new Date(dateInput);
			if (!isNaN(parsedDate.getTime())) {
				// Format as YYYY-MM-DD
				const year = parsedDate.getFullYear();
				const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
				const day = String(parsedDate.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			}
		} catch (error) {
			// If all parsing fails, return empty string to avoid API errors
			return '';
		}
	}

	return dateString;
}

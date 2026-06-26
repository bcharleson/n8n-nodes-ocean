import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import { oceanApiRequest, oceanApiRequestAllItems } from './GenericFunctions';
import {
	buildCompanySearchBody,
	buildEnrichCompanyBody,
	buildEnrichPersonBody,
	buildPeopleSearchBody,
	buildRevealBody,
	buildWarmupBody,
} from './RequestBuilders';

import { companyOperations, companyFields } from './CompanyDescription';
import { personOperations, personFields } from './PersonDescription';
import { otherOperations, otherFields } from './OtherDescription';
import { revealOperations, revealFields } from './RevealDescription';
import { autocompleteOperations, autocompleteFields } from './AutocompleteDescription';
import { loadOptions } from './methods/loadOptions';

const gettingStartedNotice = {
	displayName: 'Quick Guide — Company: Look up or Find Similar Companies. Person: Find or Enrich a Lead. Autocomplete: Cheap Spelling Helper Before Search/Enrich (0.1 Credits/run). Reveal: Get Email/phone After Search or Enrich. Other: Check Credit Balance.',
	name: 'gettingStartedNotice',
	type: 'notice' as const,
	default: '',
};

export class Ocean implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ocean.io',
		name: 'ocean',
		icon: 'file:ocean-logomark.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Find, enrich, and reveal company and people data from Ocean.io',
		defaults: {
			name: 'Ocean.io',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'oceanApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.ocean.io',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Autocomplete',
						value: 'autocomplete',
						description:
							'Low-cost lookup (0.1 credits/run) — match partial names, titles, and locations before Search or Enrich',
					},
					{
						name: 'Company',
						value: 'company',
						description: 'Find lookalike companies or enrich one company by website',
					},
					{
						name: 'Other',
						value: 'other',
						description: 'Check credit balance, download filter lists, or warmup domains',
					},
					{
						name: 'Person',
						value: 'person',
						description: 'Find lists of people or enrich one lead by name, email, or LinkedIn',
					},
					{
						name: 'Reveal',
						value: 'reveal',
						description: 'Get email addresses or phone numbers for people you already found',
					},
				],
				default: 'company',
			},
			gettingStartedNotice,
			...companyOperations,
			...personOperations,
			...revealOperations,
			...autocompleteOperations,
			...otherOperations,
			...companyFields,
			...personFields,
			...revealFields,
			...autocompleteFields,
			...otherFields,
		],
		usableAsTool: true,
	};

	methods = {
		loadOptions,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;

		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < length; i++) {
			try {
				let responseData;

				if (resource === 'company') {
					responseData = await executeCompanyOperation.call(this, i);
				} else if (resource === 'person') {
					responseData = await executePersonOperation.call(this, i);
				} else if (resource === 'reveal') {
					responseData = await executeRevealOperation.call(this, i);
				} else if (resource === 'autocomplete') {
					responseData = await executeAutocompleteOperation.call(this, i);
				} else if (resource === 'other' || resource === 'credits') {
					responseData = await executeOtherOperation.call(this, i);
				} else {
					throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not known!`, {
						itemIndex: i,
					});
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error: unknown) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}

				if (error instanceof NodeOperationError || error instanceof NodeApiError) {
					throw error as NodeOperationError;
				}

				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}

async function executeCompanyOperation(this: IExecuteFunctions, itemIndex: number): Promise<unknown> {
	const operation = this.getNodeParameter('operation', itemIndex) as string;

	if (operation === 'search') {
		return searchCompanies.call(this, itemIndex);
	}

	if (operation === 'enrich') {
		const domain = this.getNodeParameter('domain', itemIndex, '') as string;
		const body = buildEnrichCompanyBody(domain);
		return oceanApiRequest.call(this, 'POST', '/v2/enrich/company', body);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, { itemIndex });
}

async function executePersonOperation(this: IExecuteFunctions, itemIndex: number): Promise<unknown> {
	const operation = this.getNodeParameter('operation', itemIndex) as string;

	if (operation === 'search') {
		return searchPeople.call(this, itemIndex);
	}

	if (operation === 'enrich') {
		const body = buildEnrichPersonBody({
			linkedin: this.getNodeParameter('linkedin', itemIndex, '') as string,
			oceanId: this.getNodeParameter('oceanId', itemIndex, '') as string,
			name: this.getNodeParameter('personName', itemIndex, '') as string,
			firstName: this.getNodeParameter('firstName', itemIndex, '') as string,
			lastName: this.getNodeParameter('lastName', itemIndex, '') as string,
			email: this.getNodeParameter('email', itemIndex, '') as string,
			companyDomain: this.getNodeParameter('companyDomain', itemIndex, '') as string,
		});
		return oceanApiRequest.call(this, 'POST', '/v2/enrich/person', body);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, { itemIndex });
}

async function executeRevealOperation(this: IExecuteFunctions, itemIndex: number): Promise<unknown> {
	const operation = this.getNodeParameter('operation', itemIndex) as string;
	const oceanIds = this.getNodeParameter('oceanIds', itemIndex, '') as string;
	const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex, '') as string;
	const body = buildRevealBody(oceanIds, webhookUrl);

	if (operation === 'revealEmails') {
		return oceanApiRequest.call(this, 'POST', '/v2/reveal/emails', body);
	}

	if (operation === 'revealPhones') {
		return oceanApiRequest.call(this, 'POST', '/v2/reveal/phones', body);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, { itemIndex });
}

async function executeAutocompleteOperation(this: IExecuteFunctions, itemIndex: number): Promise<unknown> {
	const operation = this.getNodeParameter('operation', itemIndex) as string;
	const query = (this.getNodeParameter('query', itemIndex, '') as string).trim();

	if (!query) {
		throw new NodeOperationError(this.getNode(), 'Query is required for autocomplete operations', { itemIndex });
	}

	const endpoints: Record<string, { path: string; body: Record<string, string> }> = {
		companies: { path: '/v2/autocomplete/companies', body: { name: query } },
		jobTitles: { path: '/v2/autocomplete/job-titles', body: { query } },
		keywords: { path: '/v2/autocomplete/keywords', body: { query } },
		skills: { path: '/v2/autocomplete/skills', body: { query } },
		locations: { path: '/v2/autocomplete/locations', body: { query } },
	};

	const config = endpoints[operation];
	if (!config) {
		throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, { itemIndex });
	}

	return oceanApiRequest.call(this, 'POST', config.path, config.body);
}

async function executeOtherOperation(this: IExecuteFunctions, itemIndex: number): Promise<unknown> {
	const operation = this.getNodeParameter('operation', itemIndex) as string;

	if (operation === 'getBalance') {
		return oceanApiRequest.call(this, 'GET', '/v2/credits/balance');
	}

	if (operation === 'getDataFields') {
		return oceanApiRequest.call(this, 'GET', '/v2/data-fields');
	}

	if (operation === 'warmupCompanies') {
		const companyDomains = this.getNodeParameter('companyDomains', itemIndex, '') as string;
		const body = buildWarmupBody(companyDomains);
		return oceanApiRequest.call(this, 'POST', '/v2/warmup/companies', body);
	}

	throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, { itemIndex });
}

async function searchCompanies(this: IExecuteFunctions, itemIndex: number): Promise<unknown> {
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const body = buildCompanySearchBody({
		returnAll,
		limit: this.getNodeParameter('limit', itemIndex, 50) as number,
		lookalikeDomains: this.getNodeParameter('lookalikeDomains', itemIndex, '') as string,
		domain: this.getNodeParameter('domain', itemIndex, '') as string,
		employeeCountMin: this.getNodeParameter('employeeCountMin', itemIndex, '') as number | string,
		employeeCountMax: this.getNodeParameter('employeeCountMax', itemIndex, '') as number | string,
		countries: this.getNodeParameter('countries', itemIndex, []) as string | string[],
		industries: this.getNodeParameter('industries', itemIndex, []) as string | string[],
		companiesFiltersJson: this.getNodeParameter('companiesFiltersJson', itemIndex, '') as string,
	});

	if (returnAll) {
		return oceanApiRequestAllItems.call(this, 'POST', '/v3/search/companies', body);
	}

	const response = await oceanApiRequest.call(this, 'POST', '/v3/search/companies', body);
	return Array.isArray(response.companies) ? response.companies : [];
}

async function searchPeople(this: IExecuteFunctions, itemIndex: number): Promise<unknown> {
	const body = buildPeopleSearchBody({
		returnAll: this.getNodeParameter('returnAll', itemIndex, false) as boolean,
		limit: this.getNodeParameter('limit', itemIndex, 50) as number,
		lookalikePeople: this.getNodeParameter('lookalikePeople', itemIndex, '') as string,
		personName: this.getNodeParameter('personName', itemIndex, '') as string,
		jobTitles: this.getNodeParameter('jobTitles', itemIndex, '') as string,
		companyDomains: this.getNodeParameter('companyDomains', itemIndex, '') as string,
		countries: this.getNodeParameter('countries', itemIndex, []) as string | string[],
		peopleFiltersJson: this.getNodeParameter('peopleFiltersJson', itemIndex, '') as string,
		companiesFiltersJson: this.getNodeParameter('companiesFiltersJson', itemIndex, '') as string,
		peoplePerCompany: this.getNodeParameter('peoplePerCompany', itemIndex, '') as number | string,
	});

	if (this.getNodeParameter('returnAll', itemIndex, false)) {
		return oceanApiRequestAllItems.call(this, 'POST', '/v3/search/people', body);
	}

	const response = await oceanApiRequest.call(this, 'POST', '/v3/search/people', body);
	return Array.isArray(response.people) ? response.people : [];
}

import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
    NodeOperationError,
} from 'n8n-workflow';

import { oceanApiRequest, oceanApiRequestAllItems } from './GenericFunctions';

import { companyOperations, companyFields } from './CompanyDescription';
import { personOperations, personFields } from './PersonDescription';
import { otherOperations, otherFields } from './OtherDescription';
import { revealOperations, revealFields } from './RevealDescription';
import { autocompleteOperations, autocompleteFields } from './AutocompleteDescription';

export class Ocean implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ocean.io',
		name: 'ocean',
		icon: 'file:ocean-logomark.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Ocean.io API for lookalike company and people discovery',
		defaults: {
			name: 'Ocean.io',
		},
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
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
						name: 'Company',
						value: 'company',
						description: 'Search and enrich company data with lookalike discovery',
					},
					{
						name: 'Person',
						value: 'person',
						description: 'Search and enrich people data with lookalike discovery',
					},
					{
						name: 'Reveal',
						value: 'reveal',
						description: 'Reveal and verify contact information (emails and phones)',
					},
					{
						name: 'Autocomplete',
						value: 'autocomplete',
						description: 'Get autocomplete suggestions for companies, job titles, keywords, and skills',
					},
					{
						name: 'Other',
						value: 'other',
						description: 'Other operations (credits, data fields, warmup)',
					},
				],
				default: 'company',
			},
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
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

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
					this.helpers.returnJsonArray(responseData),
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
				throw error;
			}
		}

		return [returnData];
	}
}

// Helper operations implemented as standalone functions to preserve correct `this` typing
async function executeCompanyOperation(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const operation = this.getNodeParameter('operation', itemIndex) as string;
    if (operation === 'search') {
        return searchCompanies.call(this, itemIndex);
    } else if (operation === 'enrich') {
        return enrichCompany.call(this, itemIndex);
    }
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, { itemIndex });
}

async function executePersonOperation(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const operation = this.getNodeParameter('operation', itemIndex) as string;
    if (operation === 'search') {
        return searchPeople.call(this, itemIndex);
    } else if (operation === 'enrich') {
        return enrichPerson.call(this, itemIndex);
    }
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, { itemIndex });
}

async function executeRevealOperation(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const operation = this.getNodeParameter('operation', itemIndex) as string;
    if (operation === 'revealEmails') {
        return revealEmails.call(this, itemIndex);
    } else if (operation === 'revealPhones') {
        return revealPhones.call(this, itemIndex);
    }
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, { itemIndex });
}

async function executeAutocompleteOperation(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const operation = this.getNodeParameter('operation', itemIndex) as string;
    const query = this.getNodeParameter('query', itemIndex) as string;
    const body = { query };

    if (operation === 'companies') {
        const response = await oceanApiRequest.call(this, 'POST', '/v2/autocomplete/companies', body);
        return response;
    } else if (operation === 'jobTitles') {
        const response = await oceanApiRequest.call(this, 'POST', '/v2/autocomplete/jobTitles', body);
        return response;
    } else if (operation === 'keywords') {
        const response = await oceanApiRequest.call(this, 'POST', '/v2/autocomplete/keywords', body);
        return response;
    } else if (operation === 'skills') {
        const response = await oceanApiRequest.call(this, 'POST', '/v2/autocomplete/skills', body);
        return response;
    }
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, { itemIndex });
}

async function executeOtherOperation(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const operation = this.getNodeParameter('operation', itemIndex) as string;
    if (operation === 'getBalance') {
        return getCreditBalance.call(this, itemIndex);
    } else if (operation === 'getDataFields') {
        return getDataFields.call(this, itemIndex);
    } else if (operation === 'warmupCompanies') {
        return warmupCompanies.call(this, itemIndex);
    }
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, { itemIndex });
}

async function searchCompanies(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
    const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
    const body: any = {};
    const lookalikeDomains = this.getNodeParameter('lookalikeDomains', itemIndex, '') as string;
    if (lookalikeDomains) body.lookalike_domains = lookalikeDomains.split(',').map((d) => d.trim()).filter((d) => d);
    const companyName = this.getNodeParameter('companyName', itemIndex, '') as string;
    if (companyName) body.company_name = companyName;
    const domain = this.getNodeParameter('domain', itemIndex, '') as string;
    if (domain) body.domain = domain;
    const employeeCountMin = this.getNodeParameter('employeeCountMin', itemIndex, undefined) as number;
    const employeeCountMax = this.getNodeParameter('employeeCountMax', itemIndex, undefined) as number;
    if (employeeCountMin !== undefined || employeeCountMax !== undefined) {
        body.employee_count = {} as any;
        if (employeeCountMin !== undefined) (body.employee_count as any).min = employeeCountMin;
        if (employeeCountMax !== undefined) (body.employee_count as any).max = employeeCountMax;
    }
    const countries = this.getNodeParameter('countries', itemIndex, '') as string;
    if (countries) body.countries = countries.split(',').map((c) => c.trim()).filter((c) => c);
    const industries = this.getNodeParameter('industries', itemIndex, '') as string;
    if (industries) body.industries = industries.split(',').map((i) => i.trim()).filter((i) => i);
    if (!returnAll) body.size = limit;
    if (returnAll) {
        return await oceanApiRequestAllItems.call(this, 'POST', '/v3/search/companies', body);
    }
    const response = await oceanApiRequest.call(this, 'POST', '/v3/search/companies', body);
    return response.companies || [];
}

async function enrichCompany(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const body: any = {};
    const domain = this.getNodeParameter('domain', itemIndex) as string;
    if (domain) body.domain = domain;
    const companyName = this.getNodeParameter('companyName', itemIndex, '') as string;
    if (companyName) body.company_name = companyName;
    const response = await oceanApiRequest.call(this, 'POST', '/v2/enrich/company', body);
    return response;
}

async function searchPeople(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
    const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
    const body: any = {};
    const lookalikePeople = this.getNodeParameter('lookalikePeople', itemIndex, '') as string;
    if (lookalikePeople) body.lookalike_people = lookalikePeople.split(',').map((p) => p.trim()).filter((p) => p);
    const personName = this.getNodeParameter('personName', itemIndex, '') as string;
    if (personName) body.person_name = personName;
    const jobTitles = this.getNodeParameter('jobTitles', itemIndex, '') as string;
    if (jobTitles) body.job_titles = jobTitles.split(',').map((t) => t.trim()).filter((t) => t);
    const companyDomains = this.getNodeParameter('companyDomains', itemIndex, '') as string;
    if (companyDomains) body.company_domains = companyDomains.split(',').map((d) => d.trim()).filter((d) => d);
    const countries = this.getNodeParameter('countries', itemIndex, '') as string;
    if (countries) body.countries = countries.split(',').map((c) => c.trim()).filter((c) => c);
    if (!returnAll) body.size = limit;
    if (returnAll) {
        return await oceanApiRequestAllItems.call(this, 'POST', '/v3/search/people', body);
    }
    const response = await oceanApiRequest.call(this, 'POST', '/v3/search/people', body);
    return response.people || [];
}

async function enrichPerson(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const body: any = {};
    const email = this.getNodeParameter('email', itemIndex, '') as string;
    if (email) body.email = email;
    const linkedinHandle = this.getNodeParameter('linkedinHandle', itemIndex, '') as string;
    if (linkedinHandle) body.linkedin_handle = linkedinHandle;
    const personName = this.getNodeParameter('personName', itemIndex, '') as string;
    if (personName) body.person_name = personName;
    const response = await oceanApiRequest.call(this, 'POST', '/v2/enrich/person', body);
    return response;
}

async function getCreditBalance(this: IExecuteFunctions, _itemIndex: number): Promise<any> {
    const response = await oceanApiRequest.call(this, 'GET', '/v2/credits/balance');
    return response;
}

async function revealEmails(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const peopleData = this.getNodeParameter('people', itemIndex, {}) as any;
    const people = (peopleData.person || []).map((p: any) => {
        const person: any = {};
        if (p.linkedinHandle) person.linkedin_handle = p.linkedinHandle;
        if (p.personName) person.person_name = p.personName;
        if (p.companyDomain) person.company_domain = p.companyDomain;
        return person;
    }).filter((p: any) => Object.keys(p).length > 0);

    if (people.length === 0) {
        throw new NodeOperationError(this.getNode(), 'At least one person must be provided', { itemIndex });
    }

    const body = { people };
    const response = await oceanApiRequest.call(this, 'POST', '/v2/reveal/emails', body);
    return response;
}

async function revealPhones(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const peopleData = this.getNodeParameter('people', itemIndex, {}) as any;
    const people = (peopleData.person || []).map((p: any) => {
        const person: any = {};
        if (p.linkedinHandle) person.linkedin_handle = p.linkedinHandle;
        if (p.personName) person.person_name = p.personName;
        if (p.companyDomain) person.company_domain = p.companyDomain;
        return person;
    }).filter((p: any) => Object.keys(p).length > 0);

    if (people.length === 0) {
        throw new NodeOperationError(this.getNode(), 'At least one person must be provided', { itemIndex });
    }

    const body = { people };
    const response = await oceanApiRequest.call(this, 'POST', '/v2/reveal/phones', body);
    return response;
}

async function getDataFields(this: IExecuteFunctions, _itemIndex: number): Promise<any> {
    const response = await oceanApiRequest.call(this, 'GET', '/v2/data-fields');
    return response;
}

async function warmupCompanies(this: IExecuteFunctions, itemIndex: number): Promise<any> {
    const companyDomains = this.getNodeParameter('companyDomains', itemIndex) as string;
    const domains = companyDomains.split(',').map((d) => d.trim()).filter((d) => d);

    if (domains.length === 0) {
        throw new NodeOperationError(this.getNode(), 'At least one company domain must be provided', { itemIndex });
    }

    const body = { company_domains: domains };
    const response = await oceanApiRequest.call(this, 'POST', '/v2/other/warmupCompanies', body);
    return response;
}

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
import { creditsOperations, creditsFields } from './CreditsDescription';

export class Ocean implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ocean.io',
		name: 'ocean',
		icon: 'file:ocean-logo.png',
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
						name: 'Credits',
						value: 'credits',
						description: 'Manage and monitor your Ocean.io API credits',
					},
				],
				default: 'company',
			},
			...companyOperations,
			...personOperations,
			...creditsOperations,
			...companyFields,
			...personFields,
			...creditsFields,
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
					responseData = await this.executeCompanyOperation(i);
				} else if (resource === 'person') {
					responseData = await this.executePersonOperation(i);
				} else if (resource === 'credits') {
					responseData = await this.executeCreditsOperation(i);
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
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
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

	private async executeCompanyOperation(itemIndex: number): Promise<any> {
		const operation = this.getNodeParameter('operation', itemIndex);

		if (operation === 'search') {
			return this.searchCompanies(itemIndex);
		} else if (operation === 'enrich') {
			return this.enrichCompany(itemIndex);
		} else {
			throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, {
				itemIndex,
			});
		}
	}

	private async executePersonOperation(itemIndex: number): Promise<any> {
		const operation = this.getNodeParameter('operation', itemIndex);

		if (operation === 'search') {
			return this.searchPeople(itemIndex);
		} else if (operation === 'enrich') {
			return this.enrichPerson(itemIndex);
		} else {
			throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, {
				itemIndex,
			});
		}
	}

	private async executeCreditsOperation(itemIndex: number): Promise<any> {
		const operation = this.getNodeParameter('operation', itemIndex);

		if (operation === 'getBalance') {
			return this.getCreditBalance(itemIndex);
		} else {
			throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`, {
				itemIndex,
			});
		}
	}

	private async searchCompanies(itemIndex: number): Promise<any> {
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false);
		const limit = this.getNodeParameter('limit', itemIndex, 50);

		// Build search body
		const body: any = {};

		// Lookalike domains
		const lookalikeDomains = this.getNodeParameter('lookalikeDomains', itemIndex, '') as string;
		if (lookalikeDomains) {
			body.lookalike_domains = lookalikeDomains.split(',').map(d => d.trim()).filter(d => d);
		}

		// Basic filters
		const companyName = this.getNodeParameter('companyName', itemIndex, '') as string;
		if (companyName) {
			body.company_name = companyName;
		}

		const domain = this.getNodeParameter('domain', itemIndex, '') as string;
		if (domain) {
			body.domain = domain;
		}

		// Size filters
		const employeeCountMin = this.getNodeParameter('employeeCountMin', itemIndex, undefined) as number;
		const employeeCountMax = this.getNodeParameter('employeeCountMax', itemIndex, undefined) as number;
		if (employeeCountMin !== undefined || employeeCountMax !== undefined) {
			body.employee_count = {};
			if (employeeCountMin !== undefined) body.employee_count.min = employeeCountMin;
			if (employeeCountMax !== undefined) body.employee_count.max = employeeCountMax;
		}

		// Location filters
		const countries = this.getNodeParameter('countries', itemIndex, '') as string;
		if (countries) {
			body.countries = countries.split(',').map(c => c.trim()).filter(c => c);
		}

		// Industry filters
		const industries = this.getNodeParameter('industries', itemIndex, '') as string;
		if (industries) {
			body.industries = industries.split(',').map(i => i.trim()).filter(i => i);
		}

		// Set pagination
		if (!returnAll) {
			body.size = limit;
		}

		if (returnAll) {
			return await oceanApiRequestAllItems.call(this, 'POST', '/v3/search/companies', body);
		} else {
			const response = await oceanApiRequest.call(this, 'POST', '/v3/search/companies', body);
			return response.companies || [];
		}
	}

	private async enrichCompany(itemIndex: number): Promise<any> {
		const body: any = {};

		const domain = this.getNodeParameter('domain', itemIndex) as string;
		if (domain) {
			body.domain = domain;
		}

		const companyName = this.getNodeParameter('companyName', itemIndex, '') as string;
		if (companyName) {
			body.company_name = companyName;
		}

		const response = await oceanApiRequest.call(this, 'POST', '/v2/enrich/company', body);
		return response;
	}

	private async searchPeople(itemIndex: number): Promise<any> {
		const returnAll = this.getNodeParameter('returnAll', itemIndex, false);
		const limit = this.getNodeParameter('limit', itemIndex, 50);

		// Build search body
		const body: any = {};

		// Lookalike LinkedIn handles
		const lookalikePeople = this.getNodeParameter('lookalikePeople', itemIndex, '') as string;
		if (lookalikePeople) {
			body.lookalike_people = lookalikePeople.split(',').map(p => p.trim()).filter(p => p);
		}

		// Basic filters
		const personName = this.getNodeParameter('personName', itemIndex, '') as string;
		if (personName) {
			body.person_name = personName;
		}

		const jobTitles = this.getNodeParameter('jobTitles', itemIndex, '') as string;
		if (jobTitles) {
			body.job_titles = jobTitles.split(',').map(t => t.trim()).filter(t => t);
		}

		// Company filters
		const companyDomains = this.getNodeParameter('companyDomains', itemIndex, '') as string;
		if (companyDomains) {
			body.company_domains = companyDomains.split(',').map(d => d.trim()).filter(d => d);
		}

		// Location filters
		const countries = this.getNodeParameter('countries', itemIndex, '') as string;
		if (countries) {
			body.countries = countries.split(',').map(c => c.trim()).filter(c => c);
		}

		// Set pagination
		if (!returnAll) {
			body.size = limit;
		}

		if (returnAll) {
			return await oceanApiRequestAllItems.call(this, 'POST', '/v3/search/people', body);
		} else {
			const response = await oceanApiRequest.call(this, 'POST', '/v3/search/people', body);
			return response.people || [];
		}
	}

	private async enrichPerson(itemIndex: number): Promise<any> {
		const body: any = {};

		const email = this.getNodeParameter('email', itemIndex, '') as string;
		if (email) {
			body.email = email;
		}

		const linkedinHandle = this.getNodeParameter('linkedinHandle', itemIndex, '') as string;
		if (linkedinHandle) {
			body.linkedin_handle = linkedinHandle;
		}

		const personName = this.getNodeParameter('personName', itemIndex, '') as string;
		if (personName) {
			body.person_name = personName;
		}

		const response = await oceanApiRequest.call(this, 'POST', '/v2/enrich/person', body);
		return response;
	}

	private async getCreditBalance(itemIndex: number): Promise<any> {
		const response = await oceanApiRequest.call(this, 'GET', '/v2/credits/balance');
		return response;
	}
}

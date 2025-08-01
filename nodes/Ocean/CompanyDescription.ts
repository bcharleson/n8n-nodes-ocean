import { INodeProperties } from 'n8n-workflow';

export const companyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['company'],
			},
		},
		options: [
			{
				name: 'Search Companies',
				value: 'search',
				description: 'Find lookalike companies using Ocean.io\'s discovery engine (1 credit per company)',
				action: 'Search companies',
			},
			{
				name: 'Enrich Company',
				value: 'enrich',
				description: 'Enrich company data with Ocean.io\'s database (1 credit with domain, 5 credits without)',
				action: 'Enrich company data',
			},
		],
		default: 'search',
	},
];

export const companyFields: INodeProperties[] = [
	// Company Search Fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to the limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return (1-100)',
	},
	{
		displayName: 'Lookalike Domains',
		name: 'lookalikeDomains',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: '',
		placeholder: 'example.com, company2.com',
		description: 'Comma-separated list of company domains to find similar companies to. This is Ocean.io\'s core lookalike functionality.',
	},
	{
		displayName: 'Company Name',
		name: 'companyName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Search for companies by name (partial matches supported)',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Search for a specific company domain',
	},
	{
		displayName: 'Employee Count Min',
		name: 'employeeCountMin',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: undefined,
		description: 'Minimum number of employees',
	},
	{
		displayName: 'Employee Count Max',
		name: 'employeeCountMax',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: undefined,
		description: 'Maximum number of employees',
	},
	{
		displayName: 'Countries',
		name: 'countries',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: '',
		placeholder: 'United States, Canada, United Kingdom',
		description: 'Comma-separated list of countries to filter by',
	},
	{
		displayName: 'Industries',
		name: 'industries',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: '',
		placeholder: 'Software, Technology, SaaS',
		description: 'Comma-separated list of industries to filter by',
	},

	// Company Enrich Fields
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['enrich'],
			},
		},
		default: '',
		description: 'Company domain to enrich (recommended - costs 1 credit vs 5 credits without)',
	},
	{
		displayName: 'Company Name',
		name: 'companyName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['enrich'],
			},
		},
		default: '',
		description: 'Company name to enrich (costs 5 credits if domain not provided)',
	},
];

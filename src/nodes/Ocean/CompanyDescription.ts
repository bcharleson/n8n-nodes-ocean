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
				description:
					'Find companies similar to ones you already know — e.g. companies like topoffunnel.com (1 credit per result)',
				action: 'Search companies',
			},
			{
				name: 'Enrich Company',
				value: 'enrich',
				description:
					'Look up one company by website domain — e.g. stripe.com returns firmographics (1 credit)',
				action: 'Enrich company data',
			},
		],
		default: 'search',
	},
];

export const companyFields: INodeProperties[] = [
	{
		displayName:
			'Find lookalike companies. Start with Lookalike Domains — enter one or more website domains (like topoffunnel.com) and Ocean returns similar companies. Add filters below to narrow results. Each company returned uses 1 credit.',
		name: 'companySearchNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Look up a single company by website. Enter Domain below (e.g. stripe.com). You can paste a full URL — https and www are stripped automatically. Uses 1 credit per run.',
		name: 'companyEnrichNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['enrich'],
			},
		},
		default: '',
	},
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
		description: 'Whether to return all results or only up to a given limit',
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
		description: 'Max number of results to return',
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
		description:
			'Website domains of companies you want to find lookalikes for. Separate multiple with commas. Paste full URLs if needed — https and www are removed automatically.',
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
		placeholder: 'example.com',
		description: 'Optional — only return results that include this specific company domain',
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
		typeOptions: {
			minValue: 0,
		},
		default: 0,
		description: 'Minimum number of employees. Leave at 0 to ignore.',
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
		typeOptions: {
			minValue: 0,
		},
		default: 0,
		description: 'Maximum number of employees. Leave at 0 to ignore.',
	},
	{
		displayName: 'Country Names or IDs',
		name: 'countries',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getCountries',
		},
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: [],
		description: 'Limit results to companies headquartered in these countries. Pick from the dropdown — no need to type country codes yourself. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Industry Names or IDs',
		name: 'industries',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getIndustries',
		},
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: [],
		description: 'Limit results to these industries. Pick from the dropdown so values match Ocean exactly. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Companies Filters JSON',
		name: 'companiesFiltersJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: '',
		description:
			'Optional advanced filters in JSON. Leave blank unless you need filters not listed above. Merges with the simple fields in this node.',
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
		placeholder: 'stripe.com',
		description:
			'Root company domain to enrich (1 credit). Accepts stripe.com, www.stripe.com, or https://stripe.com — normalized automatically before the API call.',
	},
];

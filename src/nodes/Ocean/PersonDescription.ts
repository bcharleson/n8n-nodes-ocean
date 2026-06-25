import { INodeProperties } from 'n8n-workflow';

export const personOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['person'],
			},
		},
		options: [
			{
				name: 'Search People',
				value: 'search',
				description: 'Find people using Ocean.io v3 search (1-3 credits per person)',
				action: 'Search people',
			},
			{
				name: 'Enrich Person',
				value: 'enrich',
				description: 'Enrich person data with Ocean.io\'s database (3 credits per person)',
				action: 'Enrich person data',
			},
		],
		default: 'search',
	},
];

export const personFields: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['person'],
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
				resource: ['person'],
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
		displayName: 'Lookalike People',
		name: 'lookalikePeople',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['search'],
			},
		},
		default: '',
		placeholder: 'john-doe-123456, jane-smith-789012',
		description: 'Comma-separated LinkedIn handles for lookalike people search',
	},
	{
		displayName: 'Person Name',
		name: 'personName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['search', 'enrich'],
			},
		},
		default: '',
		description: 'Person name filter for search, or full name for enrich',
	},
	{
		displayName: 'Job Titles',
		name: 'jobTitles',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['search'],
			},
		},
		default: '',
		placeholder: 'CEO, VP of Sales',
		description: 'Comma-separated job titles (mapped to jobTitleKeywords.anyOf)',
	},
	{
		displayName: 'Company Domains',
		name: 'companyDomains',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['search'],
			},
		},
		default: '',
		placeholder: 'example.com, company2.com',
		description: 'Comma-separated company domains (mapped to companiesFilters.domains)',
	},
	{
		displayName: 'Countries',
		name: 'countries',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['search'],
			},
		},
		default: '',
		placeholder: 'us, ca, gb',
		description: 'Comma-separated country codes',
	},
	{
		displayName: 'People Per Company',
		name: 'peoplePerCompany',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Maximum people to return per company',
	},
	{
		displayName: 'People Filters JSON',
		name: 'peopleFiltersJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Advanced people filters as JSON. Same shape as ocean-agent-cli --people-filters.',
	},
	{
		displayName: 'Companies Filters JSON',
		name: 'companiesFiltersJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Advanced company filters as JSON for people search',
	},
	{
		displayName: 'LinkedIn URL',
		name: 'linkedin',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
		default: '',
		placeholder: 'https://linkedin.com/in/johndoe',
		description: 'LinkedIn profile URL',
	},
	{
		displayName: 'Ocean ID',
		name: 'oceanId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
		default: '',
		description: 'Ocean.io person ID',
	},
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
		default: '',
		description: 'First name (use with last name if no other identifier)',
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
		default: '',
		description: 'Last name (use with first name if no other identifier)',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
		default: '',
		description: 'Email address to enrich',
	},
	{
		displayName: 'Company Domain',
		name: 'companyDomain',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
		default: '',
		description: 'Company domain to help match the person',
	},
];

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
				description: 'Find lookalike people using Ocean.io\'s discovery engine (1-3 credits per person)',
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
	// Person Search Fields
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
		description: 'Comma-separated list of LinkedIn handles to find similar people to. This is Ocean.io\'s core lookalike functionality.',
	},
	{
		displayName: 'Person Name',
		name: 'personName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Search for people by name (partial matches supported)',
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
		placeholder: 'CEO, CTO, VP of Sales, Marketing Director',
		description: 'Comma-separated list of job titles to filter by',
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
		description: 'Comma-separated list of company domains to find people from',
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
		placeholder: 'United States, Canada, United Kingdom',
		description: 'Comma-separated list of countries to filter by',
	},

	// Person Enrich Fields
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
		displayName: 'LinkedIn Handle',
		name: 'linkedinHandle',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
		default: '',
		placeholder: 'john-doe-123456',
		description: 'LinkedIn handle (the part after linkedin.com/in/)',
	},
	{
		displayName: 'Person Name',
		name: 'personName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
		default: '',
		description: 'Full name of the person to enrich',
	},
];

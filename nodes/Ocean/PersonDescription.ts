import { INodeProperties } from 'n8n-workflow';

import { expressionHelpNotice } from './HelperNotices';

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
				description:
					'Find a list of people matching job title, company, country, and other filters (1–3 credits per person)',
				action: 'Search people',
			},
			{
				name: 'Enrich Person',
				value: 'enrich',
				description:
					'Look up one person — fill in LinkedIn, email, name, or first + last name (3 credits per person)',
				action: 'Enrich person data',
			},
		],
		default: 'search',
	},
];

export const personFields: INodeProperties[] = [
	{
		displayName:
			'Build a list of people. Combine filters below — e.g. Job Titles "CEO" + Company Domains "stripe.com" + Countries "United States". Each person returned uses 1–3 credits depending on your Ocean plan.',
		name: 'personSearchNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['search'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Look up one person. Fill in at least ONE identifier below — LinkedIn URL, email, full name, or first name + last name together. Tip: name + work email (e.g. Brandon Charleson + brandon@topoffunnel.com) works well for lead enrichment. Uses 3 credits.',
		name: 'personEnrichNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
		default: '',
	},
	{
		...expressionHelpNotice,
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
	},
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
		description: 'Whether to return all results or only up to a given limit',
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
		description: 'Max number of results to return',
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
		description:
			'Find people similar to these LinkedIn profiles. Use the handle from the URL (the part after /in/). Separate multiple with commas.',
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
		description: 'Filter by name (Search) or enter the person\'s full name (Enrich)',
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
		description: 'Filter by job title — separate multiple titles with commas, e.g. CEO, VP of Sales',
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
		description: 'Only return people who work at these companies — enter website domains, comma-separated',
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
				resource: ['person'],
				operation: ['search'],
			},
		},
		default: [],
		description: 'Limit results to people in these countries. Pick from the dropdown. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
		description:
			'Optional advanced people filters in JSON. Leave blank unless you need filters not listed above.',
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
		description:
			'Optional — filter people by company attributes (size, industry, etc.) in JSON. Leave blank for most workflows.',
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
		description: 'LinkedIn profile link — one of the best ways to identify someone',
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
		description: 'Ocean person ID — use if you already have it from a previous Search or Enrich step',
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
		description: 'First name — use together with Last Name if you do not have LinkedIn or email',
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
		description: 'Last name — use together with First Name if you do not have LinkedIn or email',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		displayOptions: {
			show: {
				resource: ['person'],
				operation: ['enrich'],
			},
		},
		default: '',
		description: 'Work or personal email — works well combined with Person Name for lead lookup',
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
		placeholder: 'stripe.com',
		description:
			'Optional — the company website (e.g. stripe.com) helps Ocean match the right person. Normalized automatically.',
	},
];

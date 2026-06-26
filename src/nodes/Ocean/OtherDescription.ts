import { INodeProperties } from 'n8n-workflow';

export const otherOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['other'],
			},
		},
		options: [
			{
				name: 'Get Credit Balance',
				value: 'getBalance',
				description: 'See how many Ocean credits you have left (free — no credits used)',
				action: 'Get credit balance',
			},
			{
				name: 'Get Data Fields',
				value: 'getDataFields',
				description:
					'Download Ocean\'s full list of industries, countries, and filter options (free — useful for reference)',
				action: 'Get data fields',
			},
			{
				name: 'Warmup Companies',
				value: 'warmupCompanies',
				description: 'Pre-load company data so later searches on those domains run faster',
				action: 'Warmup companies',
			},
		],
		default: 'getBalance',
	},
];

export const otherFields: INodeProperties[] = [
	{
		displayName:
			'Check your remaining Ocean credits before running large searches. Returns standard, email, and phone credit balances. Free to run.',
		name: 'otherBalanceNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['other'],
				operation: ['getBalance'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Returns Ocean\'s master lists (industries, countries, technologies, etc.). Most users do not need this — Search nodes already offer country and industry dropdowns. Use this when you want to inspect or export the raw lists.',
		name: 'otherDataFieldsNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['other'],
				operation: ['getDataFields'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Tell Ocean to pre-load data for specific company domains before you search or enrich them. Enter domains comma-separated. Optional performance step — skip unless Ocean support recommended it.',
		name: 'otherWarmupNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['other'],
				operation: ['warmupCompanies'],
			},
		},
		default: '',
	},
	{
		displayName: 'Company Domains',
		name: 'companyDomains',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['other'],
				operation: ['warmupCompanies'],
			},
		},
		default: '',
		description: 'Website domains to pre-load — e.g. stripe.com, hubspot.com',
		placeholder: 'stripe.com, hubspot.com',
	},
];

// Keep the old exports for backward compatibility
export const creditsOperations = otherOperations;
export const creditsFields = otherFields;

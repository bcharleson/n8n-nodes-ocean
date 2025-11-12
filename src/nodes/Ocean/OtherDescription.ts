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
				description: 'Check your current Ocean.io credit balance (free operation)',
				action: 'Get credit balance',
			},
			{
				name: 'Get Data Fields',
				value: 'getDataFields',
				description: 'Get all valid data fields (industries, technologies, regions, etc.) - free operation',
				action: 'Get data fields',
			},
			{
				name: 'Warmup Companies',
				value: 'warmupCompanies',
				description: 'Pre-load company data for faster subsequent searches',
				action: 'Warmup companies',
			},
		],
		default: 'getBalance',
	},
];

export const otherFields: INodeProperties[] = [
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
		required: true,
		description: 'Comma-separated list of company domains to warmup',
		placeholder: 'example.com, company.com',
	},
];

// Keep the old exports for backward compatibility
export const creditsOperations = otherOperations;
export const creditsFields = otherFields;


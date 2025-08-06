import { INodeProperties } from 'n8n-workflow';

export const creditsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['credits'],
			},
		},
		options: [
			{
				name: 'Get Credit Balance',
				value: 'getBalance',
				description: 'Check your current Ocean.io credit balance (free operation)',
				action: 'Get credit balance',
			},
		],
		default: 'getBalance',
	},
];

export const creditsFields: INodeProperties[] = [
	// No additional fields needed for credit balance operation
];

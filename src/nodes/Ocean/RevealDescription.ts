import { INodeProperties } from 'n8n-workflow';

export const revealOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['reveal'],
			},
		},
		options: [
			{
				name: 'Reveal Emails',
				value: 'revealEmails',
				description: 'Reveal email addresses by Ocean person ID (async via webhook)',
				action: 'Reveal emails',
			},
			{
				name: 'Reveal Phones',
				value: 'revealPhones',
				description: 'Reveal phone numbers by Ocean person ID (async via webhook)',
				action: 'Reveal phones',
			},
		],
		default: 'revealEmails',
	},
];

export const revealFields: INodeProperties[] = [
	{
		displayName: 'Ocean Person IDs',
		name: 'oceanIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['reveal'],
			},
		},
		default: '',
		placeholder: 'abc123, def456',
		description: 'Comma-separated Ocean.io person IDs to reveal contact data for',
	},
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['reveal'],
			},
		},
		default: '',
		placeholder: 'https://your-app.com/webhooks/ocean',
		description: 'URL where Ocean.io sends reveal results asynchronously',
	},
];

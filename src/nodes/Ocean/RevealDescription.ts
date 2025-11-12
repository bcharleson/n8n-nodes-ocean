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
				description: 'Reveal and verify email addresses (uses email credits)',
				action: 'Reveal emails',
			},
			{
				name: 'Reveal Phones',
				value: 'revealPhones',
				description: 'Reveal and verify phone numbers (uses phone credits)',
				action: 'Reveal phones',
			},
		],
		default: 'revealEmails',
	},
];

export const revealFields: INodeProperties[] = [
	// Common fields for both operations
	{
		displayName: 'People',
		name: 'people',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['reveal'],
			},
		},
		default: {},
		placeholder: 'Add Person',
		description: 'People to reveal contact information for',
		options: [
			{
				name: 'person',
				displayName: 'Person',
				values: [
					{
						displayName: 'LinkedIn Handle',
						name: 'linkedinHandle',
						type: 'string',
						default: '',
						description: 'LinkedIn handle (e.g., john-doe)',
						placeholder: 'john-doe',
					},
					{
						displayName: 'Person Name',
						name: 'personName',
						type: 'string',
						default: '',
						description: 'Full name of the person',
						placeholder: 'John Doe',
					},
					{
						displayName: 'Company Domain',
						name: 'companyDomain',
						type: 'string',
						default: '',
						description: 'Company domain (e.g., example.com)',
						placeholder: 'example.com',
					},
				],
			},
		],
	},
];


import { INodeProperties } from 'n8n-workflow';

import { expressionHelpNotice } from './HelperNotices';

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
				description:
					'Get email addresses for people you already found via Search or Enrich (uses email credits, results arrive via webhook)',
				action: 'Reveal emails',
			},
			{
				name: 'Reveal Phones',
				value: 'revealPhones',
				description:
					'Get phone numbers for people you already found via Search or Enrich (uses phone credits, results arrive via webhook)',
				action: 'Reveal phones',
			},
		],
		default: 'revealEmails',
	},
];

export const revealFields: INodeProperties[] = [
	{
		displayName: 'Reveal does not return emails or phones immediately. This node starts the request — Ocean sends results to your Webhook URL a few moments later. You need Ocean person IDs from a prior Search People or Enrich Person step (the ID field in the output).',
		name: 'revealOverviewNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['reveal'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Recommended setup in n8n: (1) Set Webhook URL to {{ $execution.resumeUrl }} — (2) Add a Wait node right after this one, mode "On Webhook Call" — (3) Connect Search/Enrich → Reveal → Wait. The Wait node receives the email or phone when Ocean is done.',
		name: 'revealSetupNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['reveal'],
			},
		},
		default: '',
	},
	{
		...expressionHelpNotice,
		displayOptions: {
			show: {
				resource: ['reveal'],
			},
		},
	},
	{
		displayName: 'Ocean Person IDs',
		name: 'oceanIds',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['reveal'],
			},
		},
		default: '',
		description:
			'Person ID(s) from Search People or Enrich Person output. For one person, map the ID field from the previous node. For many, comma-separate IDs.',
	},
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['reveal'],
			},
		},
		default: '',
		placeholder: '{{ $execution.resumeUrl }}',
		description:
			'Where Ocean sends the revealed email or phone. Use {{ $execution.resumeUrl }} and a Wait node (On Webhook Call) after this step to receive results in the same workflow.',
	},
];

import { INodeProperties } from 'n8n-workflow';

import { expressionHelpNotice } from './HelperNotices';

export const autocompleteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['autocomplete'],
			},
		},
		options: [
			{
				name: 'Autocomplete Companies',
				value: 'companies',
				description:
					'Match partial company names to domain + name suggestions (0.1 credits/call) — use before Enrich or Search',
				action: 'Autocomplete companies',
			},
			{
				name: 'Autocomplete Job Titles',
				value: 'jobTitles',
				description:
					'Match partial titles to Ocean job-title keywords (0.1 credits/call) — use before Search People',
				action: 'Autocomplete job titles',
			},
			{
				name: 'Autocomplete Keywords',
				value: 'keywords',
				description:
					'Match partial text to valid company-search keywords (0.1 credits/call)',
				action: 'Autocomplete keywords',
			},
			{
				name: 'Autocomplete Locations',
				value: 'locations',
				description:
					'Match city/region names to Ocean location values (0.1 credits/call)',
				action: 'Autocomplete locations',
			},
			{
				name: 'Autocomplete Skills',
				value: 'skills',
				description:
					'Match partial text to valid people-search skills (0.1 credits/call)',
				action: 'Autocomplete skills',
			},
		],
		default: 'companies',
	},
];

export const autocompleteFields: INodeProperties[] = [
	{
		displayName:
			'How it works: enter partial text in Query → Ocean returns a list of matching suggestions immediately (same run, no webhook). This is a lookup helper — it does not return full company or person profiles, emails, or phone numbers. Pick a suggestion from the output and pass it to Search or Enrich in the next step.',
		name: 'autocompleteHowItWorksNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['autocomplete'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Credits: 0.1 credits per run (per item processed), charged once per call — not per suggestion returned. Uses your main Ocean credit balance (same pool as Search and Enrich). Much cheaper than Search (~0.2 credits per result) or Enrich (~0.1–0.2 per record), so it is worth using to fix spelling before a paid step. Returns 402 if your balance is too low. Truly free Ocean calls: Get Credit Balance and Get Data Fields only.',
		name: 'autocompleteCreditsNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['autocomplete'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Use when CRM, spreadsheet, or form values do not match Ocean exactly — e.g. "Sales Force" instead of "Salesforce". Autocomplete suggests the correct Ocean spelling before you spend more on Search or Enrich.',
		name: 'autocompleteWhenToUseNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['autocomplete'],
			},
		},
		default: '',
	},
	{
		...expressionHelpNotice,
		displayOptions: {
			show: {
				resource: ['autocomplete'],
			},
		},
	},
	{
		displayName:
			'Returns up to 15 company matches with name and domain (e.g. stripe.com). Use the domain in Enrich Company, or as a Lookalike Domain in Search Companies. Example: Query "Stripe Inc" → output domain stripe.com → Enrich Company.',
		name: 'autocompleteCompaniesNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['autocomplete'],
				operation: ['companies'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Returns up to 15 job title strings (e.g. "Head of Sales"). Copy the best match into Search People → Job Titles. Example: Query "VP Sales" → use top suggestion in your people search.',
		name: 'autocompleteJobTitlesNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['autocomplete'],
				operation: ['jobTitles'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Returns up to 15 keyword strings for company search filters. Pass the chosen keyword into Search Companies → Companies Filters JSON. Skip if you only use the simple search fields.',
		name: 'autocompleteKeywordsNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['autocomplete'],
				operation: ['keywords'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Returns up to 15 skill strings for people search filters. Pass the chosen skill into Search People → People Filters JSON. Skip if you only use the simple search fields.',
		name: 'autocompleteSkillsNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['autocomplete'],
				operation: ['skills'],
			},
		},
		default: '',
	},
	{
		displayName:
			'Returns up to 15 location strings (cities, regions, metro areas). Use for city-level filters — the Countries dropdown on Search only covers whole countries.',
		name: 'autocompleteLocationsNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['autocomplete'],
				operation: ['locations'],
			},
		},
		default: '',
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['autocomplete'],
			},
		},
		default: '',
		description: 'Beginning of the name, title, keyword, skill, or location to look up. Type directly to test (e.g. Salesforce), or use Expression mode for data from the previous step (e.g. {{ $JSON.companyName }}). Costs 0.1 credits each time this node runs for an item.',
		placeholder: 'Salesforce',
	},
];

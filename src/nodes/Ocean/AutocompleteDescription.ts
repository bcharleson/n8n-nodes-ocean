import { INodeProperties } from 'n8n-workflow';

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
				description: 'Get company name suggestions',
				action: 'Autocomplete companies',
			},
			{
				name: 'Autocomplete Job Titles',
				value: 'jobTitles',
				description: 'Get job title suggestions',
				action: 'Autocomplete job titles',
			},
			{
				name: 'Autocomplete Keywords',
				value: 'keywords',
				description: 'Get keyword suggestions',
				action: 'Autocomplete keywords',
			},
			{
				name: 'Autocomplete Skills',
				value: 'skills',
				description: 'Get skill suggestions',
				action: 'Autocomplete skills',
			},
			{
				name: 'Autocomplete Locations',
				value: 'locations',
				description: 'Get location suggestions',
				action: 'Autocomplete locations',
			},
		],
		default: 'companies',
	},
];

export const autocompleteFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['autocomplete'],
			},
		},
		default: '',
		description: 'Search query to get autocomplete suggestions for',
		placeholder: 'Enter search term...',
	},
];

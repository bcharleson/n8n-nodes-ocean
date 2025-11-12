import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class OceanApi implements ICredentialType {
	name = 'oceanApi';

	displayName = 'Ocean.io API';

	documentationUrl = 'https://docs.ocean.io/getting-started/authentication';

	icon: Icon = {
		light: 'file:ocean-logomark.svg',
		dark: 'file:ocean-logomark.svg',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Ocean.io API key. You can find this in your Ocean.io dashboard under Settings > API Keys.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-token': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.ocean.io',
			url: '/v2/credits/balance',
			method: 'GET',
		},
	};
}

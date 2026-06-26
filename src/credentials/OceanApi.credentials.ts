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

	icon: Icon = 'file:ocean-logomark.svg';

	properties: INodeProperties[] = [
		{
			displayName:
				'Create an API key in your Ocean.io dashboard: Settings → API Keys. Paste it below. Use "Test" to confirm the connection before building workflows.',
			name: 'credentialHelpNotice',
			type: 'notice',
			default: '',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Ocean.io API key from Settings → API Keys in the Ocean dashboard',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Api-Token': '={{$credentials.apiKey}}',
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

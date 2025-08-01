import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OceanApi implements ICredentialType {
	name = 'oceanApi';

	displayName = 'Ocean.io API';

	documentationUrl = 'https://docs.ocean.io/getting-started/authentication';

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
				'X-Api-Token': '={{$credentials.apiKey}}',
			},
		},
	};
}

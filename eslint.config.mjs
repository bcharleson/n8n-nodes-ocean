import n8nEslint from '@n8n/node-cli/eslint';
import eslintPluginN8nNodesBase from 'eslint-plugin-n8n-nodes-base';

export default [
	...n8nEslint.default,
	{
		ignores: ['gulpfile.js', 'scripts/**'],
	},
	{
		files: ['src/credentials/**/*.ts', 'credentials/**/*.ts'],
		rules: {
			...eslintPluginN8nNodesBase.configs.credentials.rules,
			'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
			'n8n-nodes-base/cred-class-field-type-options-password-missing': 'off',
		},
	},
	{
		files: ['src/nodes/**/*.ts', 'nodes/**/*.ts'],
		rules: {
			...eslintPluginN8nNodesBase.configs.nodes.rules,
			'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
			'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
			'n8n-nodes-base/node-param-type-options-max-value-present': 'off',
		},
	},
];

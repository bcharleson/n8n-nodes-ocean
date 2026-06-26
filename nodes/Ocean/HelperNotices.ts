import { INodeProperties } from 'n8n-workflow';

/** Shown where users commonly map fields from a prior node (Reveal, Autocomplete, Enrich). */
export const expressionHelpNotice: INodeProperties = {
	displayName:
		'Tip — use data from the previous step: click a field, open Expression mode (the ≡ button), then enter something like {{ $json.email }} or {{ $json.companyName }}. Replace the part after $json. with your field name.',
	name: 'expressionHelpNotice',
	type: 'notice',
	default: '',
};

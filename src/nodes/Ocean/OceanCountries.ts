import type { INodePropertyOptions } from 'n8n-workflow';

/** Overrides when Intl.DisplayNames is missing or non-standard. */
const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
	us: 'United States',
	gb: 'United Kingdom',
	uk: 'United Kingdom',
};

let regionDisplayNames: Intl.DisplayNames | undefined;

function getRegionDisplayNames(): Intl.DisplayNames | undefined {
	if (regionDisplayNames) {
		return regionDisplayNames;
	}

	try {
		regionDisplayNames = new Intl.DisplayNames(['en'], { type: 'region' });
		return regionDisplayNames;
	} catch {
		return undefined;
	}
}

/** Human-readable label for dropdowns; API still receives lowercase ISO code as value. */
export function formatCountryOption(code: string): INodePropertyOptions {
	const normalized = code.trim().toLowerCase();
	const override = COUNTRY_NAME_OVERRIDES[normalized];
	const intlName = getRegionDisplayNames()?.of(normalized.toUpperCase());
	const name = override ?? intlName ?? normalized.toUpperCase();

	return {
		name: `${name} (${normalized})`,
		value: normalized,
	};
}

export function countryOptionsFromCodes(codes: string[]): INodePropertyOptions[] {
	return [...new Set(codes.map((code) => code.trim().toLowerCase()).filter((code) => /^[a-z]{2}$/.test(code)))]
		.map((code) => formatCountryOption(code))
		.sort((a, b) => a.name.localeCompare(b.name));
}

/** Fallback when /v2/data-fields is unavailable. */
export function getStaticCountryOptions(): INodePropertyOptions[] {
	const commonCodes = [
		'us', 'ca', 'gb', 'au', 'de', 'fr', 'nl', 'be', 'ch', 'at', 'ie', 'se', 'no', 'dk', 'fi',
		'es', 'it', 'pt', 'pl', 'cz', 'in', 'sg', 'hk', 'jp', 'kr', 'cn', 'br', 'mx', 'ar', 'il',
		'ae', 'sa', 'za', 'nz',
	];

	return countryOptionsFromCodes(commonCodes);
}

/** Used by expression normalization (e.g. "United States" → us). */
export const COUNTRY_NAME_TO_CODE: Record<string, string> = {
	us: 'us',
	ca: 'ca',
	gb: 'gb',
	uk: 'gb',
	au: 'au',
	de: 'de',
	fr: 'fr',
	nl: 'nl',
	in: 'in',
	'united states': 'us',
	'united states of america': 'us',
	usa: 'us',
	canada: 'ca',
	'united kingdom': 'gb',
	'great britain': 'gb',
	england: 'gb',
	australia: 'au',
	germany: 'de',
	france: 'fr',
	netherlands: 'nl',
	india: 'in',
};

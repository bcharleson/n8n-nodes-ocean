import type { IDataObject, INodePropertyOptions } from 'n8n-workflow';

import { countryOptionsFromCodes, getStaticCountryOptions } from './OceanCountries';

export function countriesFromDataFields(data: IDataObject): INodePropertyOptions[] {
	const regions = data.regions;
	if (!regions || typeof regions !== 'object' || Array.isArray(regions)) {
		return [];
	}

	const codes = Object.keys(regions as Record<string, unknown>)
		.map((code) => code.trim().toLowerCase())
		.filter((code) => /^[a-z]{2}$/.test(code));

	if (codes.length === 0) {
		return [];
	}

	return countryOptionsFromCodes(codes);
}

export function industriesFromDataFields(data: IDataObject): INodePropertyOptions[] {
	const groups = data.industries;
	if (!Array.isArray(groups)) {
		return [];
	}

	const values = new Set<string>();
	for (const group of groups) {
		if (!group || typeof group !== 'object') {
			continue;
		}

		const industries = (group as IDataObject).industries;
		if (!Array.isArray(industries)) {
			continue;
		}

		for (const industry of industries) {
			if (typeof industry === 'string' && industry.trim()) {
				values.add(industry.trim());
			}
		}
	}

	return [...values]
		.sort((a, b) => a.localeCompare(b))
		.map((industry) => ({
			name: industry,
			value: industry,
		}));
}

export function getCountryOptions(data?: IDataObject): INodePropertyOptions[] {
	if (data) {
		const fromApi = countriesFromDataFields(data);
		if (fromApi.length > 0) {
			return fromApi;
		}
	}

	return getStaticCountryOptions();
}

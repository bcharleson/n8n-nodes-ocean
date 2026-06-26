/* eslint-disable @n8n/community-nodes/require-node-api-error */
/**
 * Ocean.io request payload helpers (aligned with ocean-agent-cli).
 * @see https://github.com/bcharleson/ocean-agent-cli
 */

const COMPANY_SIZE_RANGES: Array<{ label: string; min: number; max: number }> = [
	{ label: '0-1', min: 0, max: 1 },
	{ label: '2-10', min: 2, max: 10 },
	{ label: '11-50', min: 11, max: 50 },
	{ label: '51-200', min: 51, max: 200 },
	{ label: '201-500', min: 201, max: 500 },
	{ label: '501-1000', min: 501, max: 1000 },
	{ label: '1001-5000', min: 1001, max: 5000 },
	{ label: '5001-10000', min: 5001, max: 10000 },
	{ label: '10001-50000', min: 10001, max: 50000 },
	{ label: '50001-100000', min: 50001, max: 100000 },
	{ label: '100001-500000', min: 100001, max: 500000 },
	{ label: '500000+', min: 500001, max: Number.MAX_SAFE_INTEGER },
];

export function normalizeCompaniesFilters(
	filters: Record<string, unknown>,
): Record<string, unknown> {
	const out: Record<string, unknown> = { ...filters };

	if ('domains' in out) {
		const domains = out.domains;
		delete out.domains;
		if (Array.isArray(domains) && domains.length > 0) {
			out.includeDomains = domains;
		}
	}

	const headcountMin = out.headcountMin;
	const headcountMax = out.headcountMax;
	if (headcountMin !== undefined || headcountMax !== undefined) {
		delete out.headcountMin;
		delete out.headcountMax;

		const min = headcountMin !== undefined ? Number(headcountMin) : undefined;
		const max = headcountMax !== undefined ? Number(headcountMax) : undefined;

		if (min !== undefined || max !== undefined) {
			const employeeCountLinkedin: Record<string, number> = {};
			if (min !== undefined && !Number.isNaN(min)) employeeCountLinkedin.from = min;
			if (max !== undefined && !Number.isNaN(max)) employeeCountLinkedin.to = max;
			out.employeeCountLinkedin = employeeCountLinkedin;
		}

		const sizes = companySizesForHeadcountRange(min, max);
		if (sizes.length > 0) {
			out.companySizes = sizes;
		}
	}

	// v3 company search expects primaryLocations.includeCountries, not a bare countries array.
	if (Array.isArray(out.countries) && out.countries.length > 0) {
		const countryCodes = out.countries as string[];
		delete out.countries;
		const existing =
			out.primaryLocations && typeof out.primaryLocations === 'object'
				? (out.primaryLocations as Record<string, unknown>)
				: {};
		out.primaryLocations = {
			...existing,
			includeCountries: countryCodes,
		};
	}

	// v3 company search expects IndustriesFilter, not a bare string array.
	if (Array.isArray(out.industries)) {
		out.industries = { industries: out.industries, mode: 'anyOf' };
	}

	return out;
}

function companySizesForHeadcountRange(
	min: number | undefined,
	max: number | undefined,
): string[] {
	const low = min ?? 0;
	const high = max ?? Number.MAX_SAFE_INTEGER;
	return COMPANY_SIZE_RANGES.filter((bucket) => bucket.max >= low && bucket.min <= high).map(
		(b) => b.label,
	);
}

export function normalizeDomain(value: string): string {
	return value
		.trim()
		.replace(/^https?:\/\//i, '')
		.replace(/^www\./i, '')
		.split('/')[0]
		.split('?')[0]
		.split('#')[0]
		.split(':')[0]
		.toLowerCase();
}

export function parseEnrichDomain(value: string, fieldName = 'Domain'): string {
	const trimmed = value?.trim();
	if (!trimmed) {
		throw new Error(
			`${fieldName} is required. Enter a root domain such as stripe.com (https:// and www are fine).`,
		);
	}

	const domain = normalizeDomain(trimmed);
	if (!domain || !DOMAIN_PATTERN.test(domain)) {
		throw new Error(
			`Invalid ${fieldName.toLowerCase()} "${trimmed}". Use a root domain like stripe.com or https://www.stripe.com — paths are stripped automatically.`,
		);
	}

	return domain;
}

export function parseCsvOrArray(value: string | string[]): string[] {
	if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
	if (value === undefined || value === null) return [];
	return String(value)
		.split(',')
		.map((v) => v.trim())
		.filter(Boolean);
}

/** Normalize multiOptions (array) or expression (comma-separated string) values. */
export function parseMultiValue(value: string | string[] | undefined | null): string[] {
	return parseCsvOrArray(value ?? []);
}

const DOMAIN_PATTERN =
	/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export function normalizeDomainList(values: string | string[], fieldName: string): string[] {
	const domains = parseMultiValue(values)
		.map((value) => normalizeDomain(value))
		.filter(Boolean);

	if (domains.length === 0) {
		return [];
	}

	for (const domain of domains) {
		if (!DOMAIN_PATTERN.test(domain)) {
			throw new Error(`Invalid domain in ${fieldName}: "${domain}"`);
		}
	}

	return domains;
}

export function clampSearchLimit(limit: number, returnAll: boolean): number | undefined {
	if (returnAll) {
		return undefined;
	}

	if (!Number.isFinite(limit)) {
		throw new Error('Limit must be a number between 1 and 100');
	}

	const rounded = Math.trunc(limit);
	if (rounded < 1 || rounded > 100) {
		throw new Error('Limit must be between 1 and 100');
	}

	return rounded;
}

import { COUNTRY_NAME_TO_CODE } from './OceanCountries';

/** Ocean.io expects lowercase ISO 3166-1 alpha-2 country codes (e.g. us, ca, gb). */
export function normalizeCountryCode(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) {
		throw new Error('Country value cannot be empty');
	}

	const key = trimmed.toLowerCase();
	if (COUNTRY_NAME_TO_CODE[key]) {
		return COUNTRY_NAME_TO_CODE[key];
	}

	if (/^[a-z]{2}$/i.test(trimmed)) {
		return trimmed.toLowerCase();
	}

	throw new Error(
		`Invalid country "${trimmed}". Choose from the Countries list (ISO codes such as us, ca, gb) or use a comma-separated expression.`,
	);
}

export function normalizeCountryCodes(value: string | string[] | undefined | null): string[] {
	const parsed = parseMultiValue(value);
	if (parsed.length === 0) {
		return [];
	}

	return [...new Set(parsed.map((country) => normalizeCountryCode(country)))];
}

export function normalizeIndustryValues(value: string | string[] | undefined | null): string[] {
	const parsed = parseMultiValue(value);
	if (parsed.length === 0) {
		return [];
	}

	return [...new Set(parsed.map((industry) => {
		const trimmed = industry.trim();
		if (!trimmed) {
			throw new Error('Industry value cannot be empty');
		}
		return trimmed;
	}))];
}

export function parseJsonObject(value: string, fieldName: string): Record<string, unknown> {
	if (!value?.trim()) return {};

	try {
		const parsed = JSON.parse(value) as unknown;
		if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
			throw new Error(`${fieldName} must be a JSON object`);
		}
		return parsed as Record<string, unknown>;
	} catch (error) {
		throw new Error(`Invalid ${fieldName} JSON: ${(error as Error).message}`);
	}
}

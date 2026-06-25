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
		.toLowerCase();
}

export function parseCsvOrArray(value: string | string[]): string[] {
	if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean);
	return value.split(',').map((v) => v.trim()).filter(Boolean);
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

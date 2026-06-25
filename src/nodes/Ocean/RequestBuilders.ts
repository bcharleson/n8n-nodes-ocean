import type { IDataObject } from 'n8n-workflow';

import {
	normalizeCompaniesFilters,
	normalizeDomain,
	parseCsvOrArray,
	parseJsonObject,
} from './OceanPayloads';

function setHeadcountRange(
	filters: Record<string, unknown>,
	minValue: number | string | undefined,
	maxValue: number | string | undefined,
): void {
	const min = minValue === '' || minValue === undefined ? undefined : Number(minValue);
	const max = maxValue === '' || maxValue === undefined ? undefined : Number(maxValue);

	if (min !== undefined && !Number.isNaN(min)) filters.headcountMin = min;
	if (max !== undefined && !Number.isNaN(max)) filters.headcountMax = max;
}

export function buildCompanySearchBody(input: {
	returnAll: boolean;
	limit: number;
	lookalikeDomains: string;
	domain: string;
	employeeCountMin: number | string | undefined;
	employeeCountMax: number | string | undefined;
	countries: string;
	industries: string;
	companiesFiltersJson: string;
}): IDataObject {
	const filters: Record<string, unknown> = parseJsonObject(
		input.companiesFiltersJson,
		'Companies Filters JSON',
	);

	const lookalikeDomains = parseCsvOrArray(input.lookalikeDomains);
	if (lookalikeDomains.length > 0) {
		filters.lookalikeDomains = lookalikeDomains;
	}

	const domains = parseCsvOrArray(input.domain);
	if (domains.length > 0) {
		filters.domains = domains;
	}

	setHeadcountRange(filters, input.employeeCountMin, input.employeeCountMax);

	const countries = parseCsvOrArray(input.countries);
	if (countries.length > 0) {
		filters.countries = countries;
	}

	const industries = parseCsvOrArray(input.industries);
	if (industries.length > 0) {
		filters.industries = industries;
	}

	const companiesFilters = normalizeCompaniesFilters(filters);
	if (Object.keys(companiesFilters).length === 0) {
		throw new Error(
			'At least one company search filter is required (lookalike domains, domain, countries, industries, headcount, or Companies Filters JSON)',
		);
	}

	const body: IDataObject = { companiesFilters };
	if (!input.returnAll) {
		body.size = input.limit;
	}

	return body;
}

export function buildPeopleSearchBody(input: {
	returnAll: boolean;
	limit: number;
	lookalikePeople: string;
	personName: string;
	jobTitles: string;
	companyDomains: string;
	countries: string;
	peopleFiltersJson: string;
	companiesFiltersJson: string;
	peoplePerCompany: number | string | undefined;
}): IDataObject {
	const peopleFilters: Record<string, unknown> = parseJsonObject(
		input.peopleFiltersJson,
		'People Filters JSON',
	);
	const companiesFiltersInput: Record<string, unknown> = parseJsonObject(
		input.companiesFiltersJson,
		'Companies Filters JSON',
	);

	const lookalikePeople = parseCsvOrArray(input.lookalikePeople);
	if (lookalikePeople.length > 0) {
		peopleFilters.lookalikePeople = lookalikePeople;
	}

	if (input.personName?.trim()) {
		peopleFilters.name = input.personName.trim();
	}

	const jobTitles = parseCsvOrArray(input.jobTitles);
	if (jobTitles.length > 0) {
		peopleFilters.jobTitleKeywords = { anyOf: jobTitles };
	}

	const countries = parseCsvOrArray(input.countries);
	if (countries.length > 0) {
		peopleFilters.countries = countries;
	}

	const companyDomains = parseCsvOrArray(input.companyDomains);
	if (companyDomains.length > 0) {
		companiesFiltersInput.domains = companyDomains;
	}

	const body: IDataObject = {};

	if (Object.keys(peopleFilters).length > 0) {
		body.peopleFilters = peopleFilters;
	}

	const companiesFilters = normalizeCompaniesFilters(companiesFiltersInput);
	if (Object.keys(companiesFilters).length > 0) {
		body.companiesFilters = companiesFilters;
	}

	if (!body.peopleFilters && !body.companiesFilters) {
		throw new Error(
			'At least one people or company search filter is required (lookalike people, job titles, countries, company domains, or filter JSON)',
		);
	}

	if (!input.returnAll) {
		body.size = input.limit;
	}

	if (input.peoplePerCompany !== '' && input.peoplePerCompany !== undefined) {
		const peoplePerCompany = Number(input.peoplePerCompany);
		if (!Number.isNaN(peoplePerCompany) && peoplePerCompany > 0) {
			body.peoplePerCompany = peoplePerCompany;
		}
	}

	return body;
}

export function buildEnrichCompanyBody(domain: string): IDataObject {
	if (!domain?.trim()) {
		throw new Error('Domain is required to enrich a company');
	}

	return {
		company: {
			domain: normalizeDomain(domain),
		},
	};
}

export function buildEnrichPersonBody(input: {
	linkedin: string;
	oceanId: string;
	name: string;
	firstName: string;
	lastName: string;
	email: string;
	companyDomain: string;
}): IDataObject {
	const person: Record<string, string> = {};

	if (input.linkedin?.trim()) person.linkedin = input.linkedin.trim();
	if (input.oceanId?.trim()) person.id = input.oceanId.trim();
	if (input.name?.trim()) person.name = input.name.trim();
	if (input.firstName?.trim()) person.firstName = input.firstName.trim();
	if (input.lastName?.trim()) person.lastName = input.lastName.trim();
	if (input.email?.trim()) person.email = input.email.trim();

	if (Object.keys(person).length === 0) {
		throw new Error(
			'At least one person identifier is required (LinkedIn URL, Ocean ID, name, email, or first and last name)',
		);
	}

	const body: IDataObject = { person };

	if (input.companyDomain?.trim()) {
		body.company = { domain: normalizeDomain(input.companyDomain) };
	}

	return body;
}

export function buildRevealBody(oceanIds: string, webhookUrl: string): IDataObject {
	const personIds = parseCsvOrArray(oceanIds);
	if (personIds.length === 0) {
		throw new Error('At least one Ocean person ID is required');
	}

	if (!webhookUrl?.trim()) {
		throw new Error('Webhook URL is required for reveal operations (Ocean sends results asynchronously)');
	}

	return {
		personIds,
		webhookUrl: webhookUrl.trim(),
	};
}

export function buildWarmupBody(companyDomains: string): IDataObject {
	const domains = parseCsvOrArray(companyDomains)
		.map((domain) => normalizeDomain(domain))
		.filter(Boolean);

	if (domains.length === 0) {
		throw new Error('At least one company domain is required');
	}

	return { domains };
}

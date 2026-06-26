/* eslint-disable @n8n/community-nodes/require-node-api-error */
import type { IDataObject } from 'n8n-workflow';

import {
	clampSearchLimit,
	normalizeCompaniesFilters,
	normalizeCountryCodes,
	normalizeDomainList,
	normalizeIndustryValues,
	parseEnrichDomain,
	parseMultiValue,
	parseJsonObject,
} from './OceanPayloads';

function parseHeadcount(value: number | string | undefined): number | undefined {
	if (value === '' || value === undefined || value === null) {
		return undefined;
	}

	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}

function setHeadcountRange(
	filters: Record<string, unknown>,
	minValue: number | string | undefined,
	maxValue: number | string | undefined,
): void {
	const min = parseHeadcount(minValue);
	let max = parseHeadcount(maxValue);

	// n8n number fields often default empty inputs to 0.
	if (min === 0 && max === 0) {
		return;
	}

	if (max === 0 && min !== undefined) {
		max = undefined;
	}

	if (min === undefined && max === undefined) {
		return;
	}

	if (min !== undefined && max !== undefined && min > max) {
		throw new Error('Employee Count Min cannot be greater than Employee Count Max');
	}

	if (min !== undefined) {
		filters.headcountMin = min;
	}

	if (max !== undefined) {
		filters.headcountMax = max;
	}
}

export function buildCompanySearchBody(input: {
	returnAll: boolean;
	limit: number;
	lookalikeDomains: string | string[];
	domain: string | string[];
	employeeCountMin: number | string | undefined;
	employeeCountMax: number | string | undefined;
	countries: string | string[] | undefined;
	industries: string | string[] | undefined;
	companiesFiltersJson: string;
}): IDataObject {
	const filters: Record<string, unknown> = parseJsonObject(
		input.companiesFiltersJson,
		'Companies Filters JSON',
	);

	const lookalikeDomains = normalizeDomainList(input.lookalikeDomains, 'Lookalike Domains');
	if (lookalikeDomains.length > 0) {
		filters.lookalikeDomains = lookalikeDomains;
	}

	const domains = normalizeDomainList(input.domain, 'Domain');
	if (domains.length > 0) {
		filters.domains = domains;
	}

	setHeadcountRange(filters, input.employeeCountMin, input.employeeCountMax);

	const countries = normalizeCountryCodes(input.countries);
	if (countries.length > 0) {
		filters.countries = countries;
	}

	const industries = normalizeIndustryValues(input.industries);
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
	const size = clampSearchLimit(input.limit, input.returnAll);
	if (size !== undefined) {
		body.size = size;
	}

	return body;
}

export function buildPeopleSearchBody(input: {
	returnAll: boolean;
	limit: number;
	lookalikePeople: string | string[];
	personName: string;
	jobTitles: string | string[];
	companyDomains: string | string[];
	countries: string | string[] | undefined;
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

	const lookalikePeople = parseMultiValue(input.lookalikePeople);
	if (lookalikePeople.length > 0) {
		peopleFilters.lookalikePeople = lookalikePeople;
	}

	if (input.personName?.trim()) {
		peopleFilters.name = input.personName.trim();
	}

	const jobTitles = parseMultiValue(input.jobTitles);
	if (jobTitles.length > 0) {
		peopleFilters.jobTitleKeywords = { anyOf: jobTitles };
	}

	const countries = normalizeCountryCodes(input.countries);
	if (countries.length > 0) {
		peopleFilters.countries = countries;
	}

	const companyDomains = normalizeDomainList(input.companyDomains, 'Company Domains');
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

	const size = clampSearchLimit(input.limit, input.returnAll);
	if (size !== undefined) {
		body.size = size;
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
	return {
		company: {
			domain: parseEnrichDomain(domain, 'Domain'),
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
		body.company = { domain: parseEnrichDomain(input.companyDomain, 'Company domain') };
	}

	return body;
}

export function buildRevealBody(oceanIds: string | string[], webhookUrl: string): IDataObject {
	const personIds = parseMultiValue(oceanIds);
	if (personIds.length === 0) {
		throw new Error(
			'At least one Ocean person ID is required. Use the id from Search People or Enrich Person (e.g. {{ $json.id }}).',
		);
	}

	if (!webhookUrl?.trim()) {
		throw new Error(
			'Webhook URL is required. For backend workflows, use {{ $execution.resumeUrl }} and add a Wait node (On Webhook Call) after this node.',
		);
	}

	try {
		new URL(webhookUrl.trim());
	} catch {
		throw new Error('Webhook URL must be a valid URL (https://...)');
	}

	return {
		personIds,
		webhookUrl: webhookUrl.trim(),
	};
}

export function buildWarmupBody(companyDomains: string | string[]): IDataObject {
	const domains = normalizeDomainList(companyDomains, 'Company Domains');

	if (domains.length === 0) {
		throw new Error('At least one company domain is required');
	}

	return { domains };
}

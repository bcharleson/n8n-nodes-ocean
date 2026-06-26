const assert = require('assert');
const {
	buildCompanySearchBody,
	buildPeopleSearchBody,
	buildEnrichCompanyBody,
	buildRevealBody,
	buildWarmupBody,
} = require('../dist/nodes/Ocean/RequestBuilders');

const companyBody = buildCompanySearchBody({
	returnAll: false,
	limit: 10,
	lookalikeDomains: ['stripe.com', 'shopify.com'],
	domain: '',
	employeeCountMin: 100,
	employeeCountMax: 500,
	countries: ['us'],
	industries: ['SaaS'],
	companiesFiltersJson: '',
});

assert.deepStrictEqual(companyBody.companiesFilters.lookalikeDomains, ['stripe.com', 'shopify.com']);
assert.deepStrictEqual(companyBody.companiesFilters.primaryLocations, {
	includeCountries: ['us'],
});
assert.deepStrictEqual(companyBody.companiesFilters.industries, {
	industries: ['SaaS'],
	mode: 'anyOf',
});
assert.deepStrictEqual(companyBody.companiesFilters.employeeCountLinkedin, { from: 100, to: 500 });
assert.strictEqual(companyBody.size, 10);

const emptyHeadcountBody = buildCompanySearchBody({
	returnAll: false,
	limit: 10,
	lookalikeDomains: 'stripe.com',
	domain: '',
	employeeCountMin: 0,
	employeeCountMax: 0,
	countries: [],
	industries: [],
	companiesFiltersJson: '',
});
assert.strictEqual(emptyHeadcountBody.companiesFilters.employeeCountLinkedin, undefined);
assert.strictEqual(emptyHeadcountBody.companiesFilters.companySizes, undefined);

const minOnlyBody = buildCompanySearchBody({
	returnAll: false,
	limit: 10,
	lookalikeDomains: 'topoffunnel.com',
	domain: '',
	employeeCountMin: 10,
	employeeCountMax: 0,
	countries: 'United States',
	industries: '',
	companiesFiltersJson: '',
});
assert.deepStrictEqual(minOnlyBody.companiesFilters.primaryLocations, {
	includeCountries: ['us'],
});
assert.deepStrictEqual(minOnlyBody.companiesFilters.employeeCountLinkedin, { from: 10 });
assert.strictEqual(minOnlyBody.companiesFilters.employeeCountLinkedin.to, undefined);

const expressionCountriesBody = buildCompanySearchBody({
	returnAll: false,
	limit: 10,
	lookalikeDomains: 'stripe.com',
	domain: '',
	employeeCountMin: 0,
	employeeCountMax: 0,
	countries: 'us, ca',
	industries: 'SaaS, B2B',
	companiesFiltersJson: '',
});
assert.deepStrictEqual(expressionCountriesBody.companiesFilters.primaryLocations, {
	includeCountries: ['us', 'ca'],
});
assert.deepStrictEqual(expressionCountriesBody.companiesFilters.industries, {
	industries: ['SaaS', 'B2B'],
	mode: 'anyOf',
});

const { normalizeCountryCode } = require('../dist/nodes/Ocean/OceanPayloads');
const { formatCountryOption } = require('../dist/nodes/Ocean/OceanCountries');
assert.strictEqual(normalizeCountryCode('United States'), 'us');
assert.strictEqual(normalizeCountryCode('US'), 'us');
assert.strictEqual(formatCountryOption('ad').name, 'Andorra (ad)');
assert.strictEqual(formatCountryOption('us').name, 'United States (us)');
assert.throws(() => normalizeCountryCode('Not A Country'), /Invalid country/);

assert.throws(
	() =>
		buildCompanySearchBody({
			returnAll: false,
			limit: 10,
			lookalikeDomains: 'not a domain',
			domain: '',
			employeeCountMin: 0,
			employeeCountMax: 0,
			countries: [],
			industries: [],
			companiesFiltersJson: '',
		}),
	/Invalid domain in Lookalike Domains/,
);

const peopleBody = buildPeopleSearchBody({
	returnAll: false,
	limit: 25,
	lookalikePeople: '',
	personName: '',
	jobTitles: 'CEO, VP Sales',
	companyDomains: 'acme.com',
	countries: ['us'],
	peopleFiltersJson: '',
	companiesFiltersJson: '',
	peoplePerCompany: '',
});

assert.deepStrictEqual(peopleBody.peopleFilters.jobTitleKeywords, { anyOf: ['CEO', 'VP Sales'] });
assert.deepStrictEqual(peopleBody.peopleFilters.countries, ['us']);
assert.deepStrictEqual(peopleBody.companiesFilters.includeDomains, ['acme.com']);
assert.strictEqual(peopleBody.size, 25);

assert.deepStrictEqual(buildEnrichCompanyBody('https://Stripe.com/'), {
	company: { domain: 'stripe.com' },
});

assert.deepStrictEqual(buildEnrichCompanyBody('https://www.stripe.com/about'), {
	company: { domain: 'stripe.com' },
});

assert.throws(() => buildEnrichCompanyBody(''), /Domain is required/);
assert.throws(() => buildEnrichCompanyBody('not a domain'), /Invalid domain/);

assert.deepStrictEqual(buildRevealBody(['abc', 'def'], 'https://example.com/hook'), {
	personIds: ['abc', 'def'],
	webhookUrl: 'https://example.com/hook',
});

assert.throws(() => buildRevealBody('abc', 'not-a-url'), /valid URL/);

assert.deepStrictEqual(buildWarmupBody('Acme.com, https://www.example.com/path'), {
	domains: ['acme.com', 'example.com'],
});

console.log('Request builder tests passed.');

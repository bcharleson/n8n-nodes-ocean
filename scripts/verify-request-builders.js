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
	lookalikeDomains: 'stripe.com, shopify.com',
	domain: '',
	employeeCountMin: 100,
	employeeCountMax: 500,
	countries: 'us',
	industries: 'SaaS',
	companiesFiltersJson: '',
});

assert.deepStrictEqual(companyBody.companiesFilters.lookalikeDomains, ['stripe.com', 'shopify.com']);
assert.deepStrictEqual(companyBody.companiesFilters.countries, ['us']);
assert.deepStrictEqual(companyBody.companiesFilters.industries, ['SaaS']);
assert.deepStrictEqual(companyBody.companiesFilters.employeeCountLinkedin, { from: 100, to: 500 });
assert.strictEqual(companyBody.size, 10);

const peopleBody = buildPeopleSearchBody({
	returnAll: false,
	limit: 25,
	lookalikePeople: '',
	personName: '',
	jobTitles: 'CEO, VP Sales',
	companyDomains: 'acme.com',
	countries: 'us',
	peopleFiltersJson: '',
	companiesFiltersJson: '',
	peoplePerCompany: '',
});

assert.deepStrictEqual(peopleBody.peopleFilters.jobTitleKeywords, { anyOf: ['CEO', 'VP Sales'] });
assert.deepStrictEqual(peopleBody.companiesFilters.includeDomains, ['acme.com']);
assert.strictEqual(peopleBody.size, 25);

assert.deepStrictEqual(buildEnrichCompanyBody('https://Stripe.com/'), {
	company: { domain: 'stripe.com' },
});

assert.deepStrictEqual(buildRevealBody('abc, def', 'https://example.com/hook'), {
	personIds: ['abc', 'def'],
	webhookUrl: 'https://example.com/hook',
});

assert.deepStrictEqual(buildWarmupBody('Acme.com, https://www.example.com/path'), {
	domains: ['acme.com', 'example.com'],
});

console.log('Request builder tests passed.');

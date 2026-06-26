#!/usr/bin/env node
/**
 * Live Ocean.io API smoke test for every node operation.
 * Requires OCEAN_API_TOKEN in the environment.
 *
 * Usage:
 *   OCEAN_API_TOKEN=your_token npm run verify:e2e
 */
const assert = require('assert');

const BASE_URL = 'https://api.ocean.io';
const token = process.env.OCEAN_API_TOKEN || process.env.OCEAN_API_KEY;

function assertOk(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

async function oceanRequest(method, endpoint, body) {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		method,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'X-Api-Token': token,
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	const text = await response.text();
	let data;
	try {
		data = text ? JSON.parse(text) : {};
	} catch {
		data = { raw: text };
	}

	if (!response.ok) {
		const detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail ?? data);
		const error = new Error(`${method} ${endpoint} failed (${response.status}): ${detail}`);
		error.status = response.status;
		error.detail = detail;
		throw error;
	}

	return data;
}

function hasAnyKey(obj, keys) {
	return keys.some((key) => obj[key] !== undefined);
}

function isRevealFeatureDisabled(error) {
	const detail = String(error.detail ?? error.message ?? '').toLowerCase();
	return (
		error.status === 403 &&
		(detail.includes('verification is disabled') ||
			detail.includes('insufficient email credits') ||
			detail.includes('insufficient phone credits'))
	);
}

async function runCase(name, fn) {
	process.stdout.write(`  ${name} ... `);
	try {
		await fn();
		console.log('OK');
		return { name, ok: true };
	} catch (error) {
		if (isRevealFeatureDisabled(error)) {
			console.log('SKIP (account feature unavailable)');
			return { name, ok: true, skipped: true, reason: error.message };
		}
		console.log('FAIL');
		return { name, ok: false, error: error.message };
	}
}

async function main() {
	if (!token) {
		console.error('Missing OCEAN_API_TOKEN. Set it in your environment to run live API tests.');
		console.error('Example: OCEAN_API_TOKEN=your_token npm run verify:e2e');
		process.exit(1);
	}

	console.log('Ocean.io live API E2E smoke test');
	console.log(`Base URL: ${BASE_URL}`);

	const results = [];

	results.push(
		await runCase('Other → Get Credit Balance', async () => {
			const data = await oceanRequest('GET', '/v2/credits/balance');
			assertOk(hasAnyKey(data, ['standardCredits', 'credits', 'emailCredits', 'phoneCredits']), 'Expected credit fields');
		}),
	);

	results.push(
		await runCase('Other → Get Data Fields', async () => {
			const data = await oceanRequest('GET', '/v2/data-fields');
			assertOk(typeof data === 'object' && data !== null, 'Expected data-fields object');
		}),
	);

	results.push(
		await runCase('Other → Warmup Companies', async () => {
			const data = await oceanRequest('POST', '/v2/warmup/companies', {
				domains: ['topoffunnel.com'],
			});
			assertOk(typeof data === 'object', 'Expected warmup response object');
		}),
	);

	results.push(
		await runCase('Autocomplete → Companies', async () => {
			const data = await oceanRequest('POST', '/v2/autocomplete/companies', { name: 'Stripe' });
			assertOk(Array.isArray(data.companies), 'Expected companies array');
		}),
	);

	results.push(
		await runCase('Autocomplete → Job Titles', async () => {
			const data = await oceanRequest('POST', '/v2/autocomplete/job-titles', { query: 'CEO' });
			assertOk(Array.isArray(data.jobTitles), 'Expected jobTitles array');
		}),
	);

	results.push(
		await runCase('Autocomplete → Keywords', async () => {
			const data = await oceanRequest('POST', '/v2/autocomplete/keywords', { query: 'saas' });
			assertOk(Array.isArray(data.keywords), 'Expected keywords array');
		}),
	);

	results.push(
		await runCase('Autocomplete → Skills', async () => {
			const data = await oceanRequest('POST', '/v2/autocomplete/skills', { query: 'sales' });
			assertOk(Array.isArray(data.skills), 'Expected skills array');
		}),
	);

	results.push(
		await runCase('Autocomplete → Locations', async () => {
			const data = await oceanRequest('POST', '/v2/autocomplete/locations', { query: 'San Francisco' });
			assertOk(Array.isArray(data.locations), 'Expected locations array');
		}),
	);

	results.push(
		await runCase('Company → Search Companies', async () => {
			const data = await oceanRequest('POST', '/v3/search/companies', {
				size: 1,
				companiesFilters: {
					lookalikeDomains: ['topoffunnel.com'],
				},
			});
			assertOk(Array.isArray(data.companies), 'Expected companies array');
		}),
	);

	results.push(
		await runCase('Company → Enrich Company', async () => {
			const data = await oceanRequest('POST', '/v2/enrich/company', {
				company: { domain: 'topoffunnel.com' },
			});
			assertOk(typeof data === 'object' && data !== null, 'Expected enrich company object');
		}),
	);

	results.push(
		await runCase('Person → Search People', async () => {
			const data = await oceanRequest('POST', '/v3/search/people', {
				size: 1,
				peopleFilters: {
					jobTitleKeywords: { anyOf: ['CEO'] },
				},
				companiesFilters: {
					includeDomains: ['topoffunnel.com'],
				},
			});
			assertOk(Array.isArray(data.people), 'Expected people array');
		}),
	);

	results.push(
		await runCase('Person → Enrich Person', async () => {
			const data = await oceanRequest('POST', '/v2/enrich/person', {
				person: {
					name: 'Brandon Charleson',
					email: 'brandon@topoffunnel.com',
				},
			});
			assertOk(typeof data === 'object' && data !== null, 'Expected enrich person object');
		}),
	);

	let revealPersonId;
	results.push(
		await runCase('Reveal → Reveal Emails (async start)', async () => {
			const enrich = await oceanRequest('POST', '/v2/enrich/person', {
				person: {
					name: 'Brandon Charleson',
					email: 'brandon@topoffunnel.com',
				},
			});
			revealPersonId = enrich?.person?.id || enrich?.id;
			assertOk(revealPersonId, 'Need Ocean person ID from enrich for reveal test');

			const data = await oceanRequest('POST', '/v2/reveal/emails', {
				personIds: [revealPersonId],
				webhookUrl: 'https://example.com/ocean-reveal-test',
			});
			assertOk(data.status === 'in progress' || data.status === 'in_progress' || data.status, 'Expected async reveal status');
		}),
	);

	results.push(
		await runCase('Reveal → Reveal Phones (async start)', async () => {
			if (!revealPersonId) {
				const enrich = await oceanRequest('POST', '/v2/enrich/person', {
					person: {
						name: 'Brandon Charleson',
						email: 'brandon@topoffunnel.com',
					},
				});
				revealPersonId = enrich?.person?.id || enrich?.id;
			}
			assertOk(revealPersonId, 'Need Ocean person ID from enrich for reveal test');

			const data = await oceanRequest('POST', '/v2/reveal/phones', {
				personIds: [revealPersonId],
				webhookUrl: 'https://example.com/ocean-reveal-test',
			});
			assertOk(data.status === 'in progress' || data.status === 'in_progress' || data.status, 'Expected async reveal status');
		}),
	);

	const failed = results.filter((result) => !result.ok);
	const skipped = results.filter((result) => result.skipped);
	console.log('\nSummary');
	console.log(`  Passed: ${results.length - failed.length - skipped.length}/${results.length}`);
	if (skipped.length > 0) {
		console.log(`  Skipped: ${skipped.length} (account does not have reveal feature enabled)`);
	}

	if (failed.length > 0) {
		console.log('\nFailures:');
		for (const failure of failed) {
			console.log(`  - ${failure.name}: ${failure.error}`);
		}
		process.exit(1);
	}

	console.log('\nAll live API smoke tests passed.');
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});

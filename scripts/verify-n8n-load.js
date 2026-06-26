#!/usr/bin/env node
/**
 * Loads the built package the same way n8n does when N8N_CUSTOM_EXTENSIONS is set.
 */
const path = require('path');
const fs = require('fs');

const pkgRoot = path.resolve(__dirname, '..');
const pkg = require(path.join(pkgRoot, 'package.json'));

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function loadClass(relativePath, exportName) {
	const modulePath = path.join(pkgRoot, relativePath);
	assert(fs.existsSync(modulePath), `Missing file: ${relativePath}`);
	const loaded = require(modulePath);
	assert(loaded[exportName], `Class ${exportName} not exported from ${relativePath}`);
	return loaded[exportName];
}

const Ocean = loadClass('dist/nodes/Ocean/Ocean.node.js', 'Ocean');
const OceanApi = loadClass('dist/credentials/OceanApi.credentials.js', 'OceanApi');

new Ocean();
new OceanApi();

for (const nodePath of pkg.n8n.nodes) {
	assert(fs.existsSync(path.join(pkgRoot, nodePath)), `Configured node missing: ${nodePath}`);
}

for (const credentialPath of pkg.n8n.credentials) {
	assert(fs.existsSync(path.join(pkgRoot, credentialPath)), `Configured credential missing: ${credentialPath}`);
}

console.log('n8n community node load simulation passed.');
console.log(`- nodes: ${pkg.n8n.nodes.join(', ')}`);
console.log(`- credentials: ${pkg.n8n.credentials.join(', ')}`);

const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const root = path.join(__dirname, '..');

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function loadClass(relativePath, exportName) {
	const modulePath = path.join(root, relativePath);
	assert(fs.existsSync(modulePath), `Missing file: ${relativePath}`);
	const loaded = require(modulePath);
	assert(loaded[exportName], `Class ${exportName} not exported from ${relativePath}`);
	return loaded[exportName];
}

const Ocean = loadClass('dist/nodes/Ocean/Ocean.node.js', 'Ocean');
const OceanApi = loadClass('dist/credentials/OceanApi.credentials.js', 'OceanApi');

assert(typeof Ocean === 'function', 'Ocean export must be a class/function');
assert(typeof OceanApi === 'function', 'OceanApi export must be a class/function');

const node = new Ocean();
assert(node.description?.name === 'ocean', 'Ocean node name must be "ocean"');
assert(Array.isArray(node.description?.properties), 'Ocean node must define properties');

const credentials = new OceanApi();
assert(credentials.name === 'oceanApi', 'Credential name must be oceanApi');

for (const nodePath of pkg.n8n.nodes) {
	assert(fs.existsSync(path.join(root, nodePath)), `Configured node missing: ${nodePath}`);
}

for (const credentialPath of pkg.n8n.credentials) {
	assert(fs.existsSync(path.join(root, credentialPath)), `Configured credential missing: ${credentialPath}`);
}

for (const entry of [...pkg.n8n.nodes, ...pkg.n8n.credentials]) {
	const sourcePath = entry.replace(/^dist\//, '').replace(/\.js$/, '.ts');
	assert(
		fs.existsSync(path.join(root, sourcePath)),
		`Creator Portal source file missing in repo: ${sourcePath} (from ${entry})`,
	);
}

const iconPath = path.join(root, 'dist/nodes/Ocean/ocean-logomark.svg');
const iconDarkPath = path.join(root, 'dist/nodes/Ocean/ocean-logomark.dark.svg');
assert(fs.existsSync(iconPath), 'Node icon missing from dist output');
assert(fs.existsSync(iconDarkPath), 'Node dark icon missing from dist output');

console.log('Package verification passed.');
console.log(`- Node: ${node.description.displayName}`);
console.log(`- Version: ${pkg.version}`);
console.log(`- npm name: ${pkg.name}`);

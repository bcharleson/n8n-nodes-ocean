#!/usr/bin/env node
/**
 * Runs the same structural checks used before publish, plus n8n-node lint.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(label, args) {
	console.log(`\n==> ${label}`);
	const result = spawnSync(npm, args, { cwd: root, stdio: 'inherit', env: process.env });
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

run('Build', ['run', 'build']);
run('Package verification', ['run', 'verify']);
run('n8n community node lint', ['run', 'lint']);

console.log('\nAudit verification passed.');

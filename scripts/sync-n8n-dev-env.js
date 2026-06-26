#!/usr/bin/env node
/**
 * Ensures a sibling n8n-dev-ocean environment exists with n8n@latest
 * and this community node linked via file: dependency.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEV_ENV_DIR = path.resolve(PROJECT_ROOT, '..', 'n8n-dev-ocean');
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runNpm(args, cwd) {
	const result = spawnSync(NPM, args, { cwd, stdio: 'inherit', env: process.env });
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

function npmView(args) {
	return execFileSync(NPM, ['view', ...args], { encoding: 'utf8' }).trim();
}

function ensureDevEnvPackageJson() {
	if (!fs.existsSync(DEV_ENV_DIR)) {
		fs.mkdirSync(DEV_ENV_DIR, { recursive: true });
	}

	const packageJsonPath = path.join(DEV_ENV_DIR, 'package.json');
	const packageJson = {
		name: 'n8n-dev-ocean',
		version: '1.0.0',
		private: true,
		description: 'Local n8n dev instance for n8n-nodes-ocean (auto-managed)',
		scripts: {
			start:
				'N8N_PORT=5678 N8N_CUSTOM_EXTENSIONS=node_modules/n8n-nodes-ocean n8n start',
		},
		dependencies: {
			n8n: 'latest',
			'n8n-nodes-ocean': `file:${PROJECT_ROOT}`,
		},
	};

	fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function syncN8nWorkflowDevDependency(latestN8nVersion) {
	const n8nWorkflowVersion = npmView([
		`n8n@${latestN8nVersion}`,
		'dependencies.n8n-workflow',
	]);

	const parentPackagePath = path.join(PROJECT_ROOT, 'package.json');
	const parentPackage = JSON.parse(fs.readFileSync(parentPackagePath, 'utf8'));
	const target = `^${n8nWorkflowVersion}`;
	const current = parentPackage.devDependencies?.['n8n-workflow'];

	if (current !== target) {
		parentPackage.devDependencies = parentPackage.devDependencies || {};
		parentPackage.devDependencies['n8n-workflow'] = target;
		fs.writeFileSync(parentPackagePath, `${JSON.stringify(parentPackage, null, 2)}\n`);
		console.log(`Updated n8n-workflow devDependency to ${target}`);
		runNpm(['install'], PROJECT_ROOT);
	}
}

function main() {
	const latest = npmView(['n8n', 'version']);
	console.log(`Ensuring n8n dev environment uses latest stable n8n (${latest})...`);

	ensureDevEnvPackageJson();
	runNpm(['install', 'n8n@latest', '--save'], DEV_ENV_DIR);
	runNpm(['install', '--prefer-online'], DEV_ENV_DIR);

	const n8nBin = path.join(DEV_ENV_DIR, 'node_modules', '.bin', 'n8n');
	const installed = execFileSync(n8nBin, ['--version'], { encoding: 'utf8' }).trim();

	console.log(`n8n dev environment ready at ${DEV_ENV_DIR} (n8n ${installed})`);

	try {
		syncN8nWorkflowDevDependency(latest);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.warn('Could not sync n8n-workflow devDependency:', message);
	}
}

main();

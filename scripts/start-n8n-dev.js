#!/usr/bin/env node
const path = require('path');
const { spawn } = require('child_process');

const DEV_ENV_DIR = path.resolve(__dirname, '..', '..', 'n8n-dev-ocean');
const n8nBin = path.join(DEV_ENV_DIR, 'node_modules', '.bin', 'n8n');

const child = spawn(
	n8nBin,
	['start'],
	{
		cwd: DEV_ENV_DIR,
		stdio: 'inherit',
		env: {
			...process.env,
			N8N_PORT: '5678',
			N8N_CUSTOM_EXTENSIONS: path.join(DEV_ENV_DIR, 'node_modules', 'n8n-nodes-ocean'),
		},
	},
);

child.on('exit', (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 0);
});

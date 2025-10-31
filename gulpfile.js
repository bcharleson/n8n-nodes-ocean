const { src, dest, parallel } = require('gulp');

function buildNodeIcons() {
	return src('src/nodes/Ocean/*.{svg,png}').pipe(dest('dist/nodes/Ocean'));
}

function buildCredentialIcons() {
	// Copy to both credentials and nodes directories
	// n8n resolves credential icons relative to nodes directory
	src('src/credentials/*.svg').pipe(dest('dist/credentials'));
	return src('src/credentials/*.svg').pipe(dest('dist/nodes/Ocean/Ocean'));
}

const buildIcons = parallel(buildNodeIcons, buildCredentialIcons);

exports['build:icons'] = buildIcons;

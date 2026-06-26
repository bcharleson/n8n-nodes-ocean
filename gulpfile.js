const { src, dest, parallel } = require('gulp');

function buildNodeIcons() {
	src('nodes/Ocean/*.node.json').pipe(dest('dist/nodes/Ocean'));
	return src('nodes/Ocean/*.{svg,png}').pipe(dest('dist/nodes/Ocean'));
}

function buildCredentialIcons() {
	src('credentials/*.svg').pipe(dest('dist/credentials'));
	return src('credentials/*.svg').pipe(dest('dist/nodes/Ocean/Ocean'));
}

const buildIcons = parallel(buildNodeIcons, buildCredentialIcons);

exports['build:icons'] = buildIcons;

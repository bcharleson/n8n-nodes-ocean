const fs = require('fs');
const path = require('path');

// Create dist directory structure
const distDir = path.join(__dirname, 'dist');
const distNodesDir = path.join(distDir, 'nodes', 'Ocean');
const distCredentialsDir = path.join(distDir, 'credentials');

// Create directories
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(distNodesDir, { recursive: true });
fs.mkdirSync(distCredentialsDir, { recursive: true });

// Create a simple index.js in dist that exports the Ocean node
const indexContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ocean = void 0;
var Ocean_node_1 = require("./nodes/Ocean/Ocean.node");
Object.defineProperty(exports, "Ocean", { enumerable: true, get: function () { return Ocean_node_1.Ocean; } });
`;

fs.writeFileSync(path.join(distDir, 'index.js'), indexContent);

console.log('Build structure created successfully!');
console.log('Note: This is a temporary fix. You should still run proper TypeScript compilation when npm issues are resolved.');
#!/usr/bin/env node

var fs = require('fs');
var futures = require('futures');
var optimist = require('optimist');
require('Array.prototype.forEachAsync');

// Command Line FTW!
var argv = optimist.usage('Usage: $0 [--disc DISC TYPE]')
	.describe('disc', 'Type of disc being used: cd, dvd, or bluray.')
	.default('disc', 'cd')
	.argv;

// Show the help information
if(argv.help) {
	optimist.showHelp();

	process.exit(0);
}

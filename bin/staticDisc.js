#!/usr/bin/env node

var fs = require('fs');
var futures = require('futures');
var join = require('join');
var path = require('path');
var optimist = require('optimist');
require('Array.prototype.forEachAsync');

// Command Line FTW!
var argv = optimist.usage('Usage: $0 [--disc DISC TYPE]')
	.describe('disc', 'Type of disc being used: cd, dvd, or bluray.')
	.describe('bufferSize', 'Number of MB to use as a buffer to ensure all the files will bit on the disc.')
	.describe('source', 'Source directory containing the media files')
	.describe('sort', 'Type of sorting to use: name')
	.default('disc', 'cd')
	.default('bufferSize', 5)
	.default('source', process.cwd())
	.default('sort', 'name')
	.argv;

// Show the help information
if(argv.help) {
	optimist.showHelp();

	process.exit(0);
}

// See http://en.wikipedia.org/wiki/Gigabyte
var settings = {
	buffer: argv.bufferSize * 1000000, // Convert to MB
	capacity: {
		cd: 700 * 1024 * 1024,
		dvd: 4700000000,
		bluray: 25000000000
	},
	types: {
		image: [],
		valid: /\.(cr2|jpg|jpeg|mov|png)$/
	}
};

// Keep track of the discs uses
var discs = [];

var sequence = futures.sequence();

// Read what files are in the source directory
sequence.then(function(next, error) {
	fs.readdir(argv.source, next);
});

// Prune out any invalid files
sequence.then(function(next, error, files) {
	for(var i = files.length - 1; i >= 0; i--) {
		if(!files[i].match(settings.types.valid)) {
			files.splice(i, 1);
		}
	}

	next(error, files);
});

// Allow for sorting
sequence.then(function(next, error, files) {
	// Determine the order to split into multiple discs
	switch(argv.sort) {
		case 'name':
			files.sort();

			break;
	}

	next(error, files);
});

// Get the file information for each file
sequence.then(function(next, error, files) {
	var joined = join();
	var callbacks = [];

	// Retrieve the file stats
	for(var i = 0; i < files.length; i++) {
		callbacks.push(joined.add());

		fs.stat(argv.source + '/' + files[i], callbacks[i]);
	}

	joined.when(function() {
		var stats = [];

		// Convert the results into an array of just the stats
		for(var i = 0; i < arguments.length; i++) {
			stats.push(arguments[i][1]);
		}

		next(error, files, stats);
	});
});

sequence.then(function(next, error, files, stats) {
	console.log(files, stats);
});

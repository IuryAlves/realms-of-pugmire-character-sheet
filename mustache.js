#!/usr/bin/env node

var fs = require('fs');
var mustache = require('mustache');
var process = require('process');
var path = require('path');


var args = process.argv;
var baseTemplate = args[2];
var output = args[3];
var view = {};
var partials = {};
var customTags = ['<%', '%>'];
var templateDir = __dirname + '/templates/';

var readTemplate = function(templateName, encoding) {
	return fs.readFileSync(templateDir + templateName, 'utf-8');
};

fs.readdirSync(templateDir).forEach(function(filename) {
	partial_name = filename.split('.')[0];
	partials[partial_name] = readTemplate(filename);
});

var template = fs.readFileSync(__dirname + path.sep + baseTemplate, 'utf-8')
var html = mustache.render(template, view, partials, customTags);

fs.writeFileSync(output, html, 'utf-8')
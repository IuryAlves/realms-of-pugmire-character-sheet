#!/usr/bin/env node

var fs = require('fs');
var mustache = require('mustache');
var glob = require('glob');
var process = require('process');
var path = require('path');


var args = process.argv;
var environment = args[2]
var baseTemplate = args[3];
var baseCss = args[4]
var output = args[5];

var customTags = ['[{', '}]'];
var templateDir = __dirname + '/src/templates/';
var cssDir = __dirname + '/src/css/';
var isDevelopment = environment === "--development"
var isProduction = environment === "--production"


var readFiles = function(dir, pattern, suffix) {
  var partials = {};
  glob.sync(dir + pattern).forEach(function(file_path) {
    filename = file_path.split('/').pop()
    partial_name = filename.split('.')[0] + suffix
    var template = fs.readFileSync(file_path, 'utf-8');
    partials[partial_name] = template;
  });
  return partials;
};

var viewData = JSON.parse(fs.readFileSync('data.json', 'utf-8'))
var partials = readFiles(templateDir, '**/*.mustache', '')
var css_partials = readFiles(cssDir, '**/*.css', '-css')


if (isProduction){
  var template = fs.readFileSync(__dirname + path.sep + baseTemplate, 'utf-8')
  var cssTemplate = fs.readFileSync(__dirname + path.sep + baseCss, 'utf-8')
  var html = mustache.render(template, viewData, partials, customTags);
  var css = mustache.render(cssTemplate, {} , css_partials, customTags);
  fs.writeFileSync(output, html, 'utf-8')
  fs.writeFileSync('dist/realms-of-pugmire.css', css, 'utf-8')
} 
else {
  fs.readdirSync(templateDir).forEach(function(filename) {
    out_filename = filename.split('.')[0] + '.html'
    console.log('Generating file: ' + out_filename);
    var template = readTemplate(filename);
    var html = mustache.render(template, view, partials, customTags);
    fs.writeFileSync(__dirname + '/devel/' + out_filename, html, 'utf-8');
  });
}

#!/usr/bin/env node

var fs = require('fs');
var mustache = require('mustache');
var glob = require('glob');
var process = require('process');
var path = require('path');
var program = require('commander');

var customTags = ['[{', '}]'];
var templateDir = __dirname + '/src/templates/';
var cssDir = __dirname + '/src/css/';


var parse = function(args) {
  program
    .name('mustache.js')
    .description('Generate html and css files for realms-of-pugmire character sheet')
    .option('-v, --view-data <json>', 'Template data.', 'data.json')
    .option('--html-template <html-template>', 'html template file.', 'src/realms-of-pugmire.html.mustache')
    .option('--css-template <css-template>', 'css template file.', 'src/realms-of-pugmire.css.mustache')
    .option('--html-output <html-output>', 'Output file for the generated html file.', 'dist/realms-of-pugmire.html')
    .option('--css-output <css-output>', 'Output file for the generated css file.', 'dist/realms-of-pugmire.css')

  program.parse(args);
  return program
};


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


var main = function(args) {
  program = parse(args);
  var viewData = JSON.parse(fs.readFileSync(program.viewData, 'utf-8'))
  var partials = readFiles(templateDir, '**/*.mustache', '')
  var cssPartials = readFiles(cssDir, '**/*.css', '-css')
  var htmlTemplate = fs.readFileSync(`${__dirname}${path.sep}${program.htmlTemplate}`, 'utf-8')
  var cssTemplate = fs.readFileSync(`${__dirname}${path.sep}${program.cssTemplate}`, 'utf-8')
  var html = mustache.render(htmlTemplate, viewData, partials, customTags);
  var css = mustache.render(cssTemplate, {} , cssPartials, customTags);

  console.log(`Writing html to ${program.htmlOutput}`)
  fs.writeFileSync(program.htmlOutput, html, 'utf-8')

  console.log(`Writing css to ${program.cssOutput}`)
  fs.writeFileSync(program.cssOutput, css, 'utf-8')
}

main(process.argv)
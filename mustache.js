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
var availableThemes = ["pugmire", 'monarchies-of-mau'];

var parse = function(args) {
  program
    .name('mustache.js')
    .description('Generate html and css files for realms-of-pugmire character sheet')
    .option('-v, --view-data <json>', 'Template data.', 'data.json')
    .option('--html-template <html-template>', 'html template file.', 'src/realms-of-pugmire.html.mustache')
    .option('--css-template <css-template>', 'css template file.', 'src/realms-of-pugmire.css.mustache')
    .option('--html-output-dir <html-output-dir>', 'Output dir for the generated html file.', 'dist')
    .option('--css-output-dir <css-output-dir>', 'Output dir for the generated css file.', 'dist')
    .option('-t, --theme <theme>', `Character sheet theme. Choose from ${availableThemes.join(', ')}`, 'pugmire')
    .option('-a, --all', 'Build all themes', false)

  program.parse(args);
  return program;
};


var readFiles = function(dir, pattern, suffix) {
  var partials = {};
  glob.sync(dir + pattern).forEach(function(file_path) {
    filename = file_path.split('/').pop();
    partial_name = filename.split('.')[0] + suffix;
    var template = fs.readFileSync(file_path, 'utf-8');
    partials[partial_name] = template;
  });
  return partials;
};


var buildTheme = function(theme, viewData, partials, cssPartials, htmlTemplate, cssTemplate, htmlOutputDir, cssOutputDir) {
    console.log(`Using theme: ${theme}`);
    viewData['theme'] = theme;
    var cssTheme = readFiles(cssDir, `**/themes/${theme}.css`, '-css');
    cssPartials['theme-css'] = theme[`${theme}-css`];
    var html = mustache.render(htmlTemplate, viewData, partials, customTags);
    var css = mustache.render(cssTemplate, {} , cssPartials, customTags);
    var htmlOutputFile = `${htmlOutputDir}/${theme}.html`;
    var cssOutputFile = `${cssOutputDir}/${theme}.css`;

    console.log(`Writing html to ${htmlOutputFile}`);
    fs.writeFileSync(`${htmlOutputFile}`, html, 'utf-8');

    console.log(`Writing css to ${cssOutputFile}`);
    fs.writeFileSync(`${cssOutputFile}`, css, 'utf-8');
};

var main = function(args) {
  program = parse(args);
  var viewData = JSON.parse(fs.readFileSync(program.viewData, 'utf-8'));
  var partials = readFiles(templateDir, '**/*.mustache', '');
  var cssPartials = readFiles(cssDir, '**/*.css', '-css');
  var htmlTemplate = fs.readFileSync(`${__dirname}${path.sep}${program.htmlTemplate}`, 'utf-8');
  var cssTemplate = fs.readFileSync(`${__dirname}${path.sep}${program.cssTemplate}`, 'utf-8');

  if (program.all) {
    for (theme of availableThemes) {
        buildTheme(theme, viewData, partials, cssPartials, htmlTemplate, cssTemplate, program.htmlOutputDir, program.cssOutputDir);
    }
  } else {
    buildTheme(
        program.theme, viewData, partials,
        cssPartials, htmlTemplate, cssTemplate,
        program.htmlOutputDir, program.cssOutputDir
    );
  }

};

main(process.argv);

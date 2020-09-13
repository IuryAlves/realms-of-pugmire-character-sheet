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
var view = {
  isDevelopment: environment === "--development",
  isProduction: environment === "--production",
  attributes_list: [
    {
      attribute_name: "str",
      attribute_label: "Strength",
      mod_field_name: "stre_mod"
    },
    {
      attribute_name: "dex",
      attribute_label: "Dexterity",
      mod_field_name: "dex_mod"
    },
    {
      attribute_name: "con",
      attribute_label: "Constitution",
      mod_field_name: "con_mod"
    },
    {
      attribute_name: "int",
      attribute_label: "Intelligence",
      mod_field_name: "int_mod"
    },
    {
      attribute_name: "wis",
      attribute_label: "Wisdom",
      mod_field_name: "wis_mod"
    },
    {
      attribute_name: "cha",
      attribute_label: "Charisma",
      mod_field_name: "cha_mod"
    }
  ]

};

var customTags = ['[{', '}]'];
var templateDir = __dirname + '/templates/';
var cssDir = __dirname + '/css/';


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

var partials = readFiles(templateDir, '**/*.mustache', '')
var css_partials = readFiles(cssDir, '**/*.css', '-css')


if (view.isProduction){
  var template = fs.readFileSync(__dirname + path.sep + baseTemplate, 'utf-8')
  var cssTemplate = fs.readFileSync(__dirname + path.sep + baseCss, 'utf-8')
  var html = mustache.render(template, view, partials, customTags);
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

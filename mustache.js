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
      mod_field_name: "attr_stre_mod"
    },
    {
      attribute_name: "dex",
      mod_field_name: "attr_dex_mod"
    },
    {
      attribute_name: "con",
      mod_field_name: "attr_cont_mod"
    },
    {
      attribute_name: "int",
      mod_field_name: "attr_int_mod"
    },
    {
      attribute_name: "wis",
      mod_field_name: "attr_wis_mod"
    },
    {
      attribute_name: "cha",
      mod_field_name: "attr_cha_mod"
    }
  ]

};

var partials = {};
var css_partials = {};

var customTags = ['[{', '}]'];
var templateDir = __dirname + '/templates/';
var cssDir = __dirname + '/css/';

var readTemplate = function(templateName) {
	return fs.readFileSync(templateDir + templateName, 'utf-8');
};


fs.readdirSync(templateDir).forEach(function(filename) {
  	partial_name = filename.split('.')[0];
    var template = readTemplate(filename);
    partials[partial_name] = template;
});

glob.sync(cssDir + '**/*.css').forEach(function(file_path) {
  filename = file_path.split('/').pop()
  partial_name = filename.split('.')[0] + '-css';
  var css = fs.readFileSync(file_path, 'utf-8');
  css_partials[partial_name] = css;
});

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

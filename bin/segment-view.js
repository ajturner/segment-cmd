#!/usr/bin/env node
// var segment = require('segment');
var Service = require('segment/dist/node/service');
var fs = require('fs');
var program = require('commander');
var ArcGISOutput = require('../lib/arcgisoutputs.js')

var _configFile = "segment.json";
var _config = {};

exports.command = {
  arguments: '-d [name] -i [index]',
  description: 'Import data'
};

function openBrowser(url) {
  var spawn = require('child_process').spawn
  spawn('open', [url]);
}
if (require.main === module) {

  program
    .version('0.0.1')
    .option('-i, --index [index]', 'Dataset index to view')
    .option('-d, --dataset [dataset]', 'Dataset name to view')
    .parse(process.argv);

  _config = JSON.parse(fs.readFileSync(_configFile));

  var url = _config.service;

  if(program.index) {
    url += "/" + program.index + "/query?f=pjson&where=1=1&outFields=*";
    openBrowser(url);
  }
  if(program.dataset) {
    service = new Service({token: _config.token, portal: _config.host});
    service.fetch(_config.service)
     .then(function(s) {
        var id = s.layers.filter(function(e) { return e.name == program.dataset } )[0].id;
        url += "/" + id + "/query?f=pjson&where=1=1&outFields=*";
        openBrowser(url);
     }).catch(ArcGISOutput.error);

  } else {
    openBrowser(url);
  }

}
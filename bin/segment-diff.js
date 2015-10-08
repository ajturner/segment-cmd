#!/usr/bin/env node
// var segment = require('segment');
var Service = require('segment/dist/node/service');
var Layer = require('segment/dist/node/layer');
var fs = require('fs');
var program = require('commander');
var ArcGISOutput = require('../lib/arcgisoutputs.js')


// PREAMBLE //
var _configFile = "segment.json";
var _config = JSON.parse(fs.readFileSync(_configFile));

exports.command = {
  arguments: '-d [name] -i [index] -v [version]',
  description: 'Import data'
};
program
  .version('0.0.1')
  .option('-i, --index [index]', 'Dataset index to view')
  .option('-d, --dataset [dataset]', 'Dataset name to view')
  .option('-r, --revision [revision]', 'Replica version to compare')
  .parse(process.argv);
// END PREAMBLE //


function getVersion(url, version) {
  console.log("Debug getVersion: ", layer)
  layer.find({url: url})
    .then(function(l) {
      console.log("Debug fetch layer", l);
      return l.sync({version: version})
    })
    .then(function(u) {
      console.log("Debug: Sync", u)
      // showVersion(layer, version, logger);
      var mods = layer.changeStatistics;
      console.log("Changed: ", mods);
    }).catch(ArcGISOutput.error);
}

if (require.main === module) {

  service = new Service({token: _config.token, portal: _config.host});
  layer = new Layer({token: _config.token, portal: _config.host});
  var serviceUrl = _config.service;

  if(program.dataset) {
    service.fetch(serviceUrl)
     .then(function(s) {
        var id = s.layers.filter(function(e) { return e.name == program.dataset } )[0].id;
        var url = serviceUrl + "/" + id;
        getVersion(url, program.revision)
     }).catch(ArcGISOutput.error);
  } else if (program.index) {
    var url = serviceUrl + "/" + program.index;
    getVersion(url, program.revision);
  }




}
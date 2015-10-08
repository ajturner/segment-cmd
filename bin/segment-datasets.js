#!/usr/bin/env node
// var segment = require('segment');
var User = require('segment/dist/node/user');
var Service = require('segment/dist/node/service');
var Layer = require('segment/dist/node/layer');
var fs = require('fs');
var program = require('commander');
var ArcGISOutput = require('../lib/arcgisoutputs.js')
var _configFile = "segment.json";
var _config = {};

exports.command = {
  arguments: '-d [name]',
  description: 'Import data'
};

program
  .option('-i, --index', 'Include dataset index')
  .parse(process.argv);

function layerPrint(layer) {
  var output = layer.name;
  if(program.index) output += " (" + layer.id + ")";
  console.log(output);
}

if (require.main === module) {
  _config = JSON.parse(fs.readFileSync(_configFile));
  service = new Service({token: _config.token, portal: _config.host});
  service.fetch(_config.service)
   .then(function(s) {
      s.layers.map( layerPrint )
   }).catch(ArcGISOutput.error);

}
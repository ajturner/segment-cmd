#!/usr/bin/env node
// var segment = require('segment');
var User = require('segment/dist/node/user');
var Service = require('segment/dist/node/service');
var Layer = require('segment/dist/node/layer');
var fs = require('fs');
var program = require('commander');
var TerraformerParser = require('terraformer-arcgis-parser');
var ArcGISOutput = require('../lib/arcgisoutputs.js')

var _configFile = "segment.json";
var _config = {};
// because _standards_
var _attributesKey = {
  'geojson': 'properties',
  'esrijson': 'attributes'
}
// 1. Expose the metadata
exports.command = {
  arguments: '-d [name]',
  description: 'Import data'
};
program
  .version('0.0.1')
  .option('-f, --file <file>', 'File to import')
  .option('-d, --name <name>', 'Name of dataset')
  .option('-t, --type [type]', 'File type', 'esrijson')
  // .option('-l, --layer [layer]', 'URL to import a remote ArcGIS Layer')
  .parse(process.argv);

var _layerName = "VersionTest" + Math.floor(Math.random(1000)*1000);
var _fields = [
  { "name" : "ObjectID", 
    "type" : "esriFieldTypeOID", 
    "alias" : "ObjectID", 
    "sqlType" : "sqlTypeInteger", 
    "nullable" : false, 
    "editable" : false, 
    "domain" : null, 
    "defaultValue" : null
  }
]

var user, layer, service;
function createLayer(_service) {
  // console.log("Debug createLayer: ", _fields);
  return layer.create({service: _service, definition: {name: _layerName, fields: _fields}});
}

function createService(_owner) {
  return service.fetch(_config.service);
};

function createReplica(_service) {
  // console.log("Debug createReplica (layer: ", layer);
  return layer.createReplica();
}

function importData(_config) {
  return user.find(_config.username)
              .then(createService)
              .then(createLayer)
              .then(createReplica)
              .catch(function(error) {
                console.log("Error importData", error.stack);
              })  
}

var json;
var _type = 'esrijson';

function importFeatures(_layer) {
  var features = [];
  for(var i in json.features) {
    var geometry = json.features[i].geometry;
    if (_type == 'geojson') {
      geometry = TerraformerParser.convert(geometry, { "idAttribute": "ObjectID" });  
    } else if (_type == 'esrijson') { // Can't set an ObjectID 
      delete json.features[i].attributes[json.objectIdFieldName];
      // delete json.features[i].attributes["OBJECTID"]; // just in case, this still causes problems.
    }
    features.push({
      "attributes": json.features[i][_attributesKey[_type]],
      "geometry" : geometry
    });
  };

  var mods = {
    adds: JSON.stringify(features),
    updates: [],
    deletes: []
  }

  return _layer.applyEdits(mods);
}

function processInput(err,data) {
  // console.log("data", data);
  json = JSON.parse(data);

  if(_type == 'esrijson') {
    _fields = json.fields
    // .filter(function(field) {
    //     return ["OBJECTID"].indexOf(field.name) === -1;
    // });
  } else {
    var feature = json.features[0][_attributesKey[_type]];
    for(var key in feature) {
      _fields.push({ "name" : key,
          "type" : "esriFieldTypeString", 
          "alias" : key
        });
    };
  }
  importData(_config).then(importFeatures).then(function(l) {
    if(l.addResults.length > 0) console.log("Added " + l.addResults.length + " rows.");
    if(l.updateResults.length > 0) console.log("Updated " + l.updateResults.length + " rows.");
    if(l.deleteResults.length > 0) console.log("Deleted " + l.deleteResults.length + " rows.");

    l.sync().then(function(u) {
      console.log("Current version is now", u.version);
    });
  }).catch(function(error) {
    console.log("Error importData: ", error.stack);
  });

}
if (require.main === module) {
  
  _config = JSON.parse(fs.readFileSync(_configFile));

  user = new User({token: _config.token, portal: _config.host});
  service = new Service({token: _config.token, portal: _config.host});
  layer = new Layer({token: _config.token, portal: _config.host});
  _type = program.type

  // Make a new layer name based on filename
  if(program.name) {
    _layerName = program.name;
  } else {
    _layerName = program.file.replace(/\.[^/.]+$/, "").replace(/-/,'');
  }

  if(program.file) {
    console.log("Importing data..." + program.file + " -> " + _layerName);
    fs.readFile(program.file, processInput)
  } 
  // else if (program.layer) {
  //   console.log("Importing layer..." + program.layer + " -> " + _layerName);
  //   var url = program.layer.replace(/\?.+$/,'');

  //   fetch( url + "?f=json&where=1=1&outFields=*", {method: 'get', headers: {}})
  //     .then(function(response) {
  //       console.log("response", response.json())
  //       return response.json();
  //     }).then(processInput).catch(ArcGISOutput.error)
  // }
}
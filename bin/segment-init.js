#!/usr/bin/env node
// var segment = require('segment');
var User = require('segment/dist/node/user');
var Service = require('segment/dist/node/service');
var fs = require('fs');
var program = require('commander');

var program = require('commander');
var _configFile = "segment.json";
var _config = {};

// 1. Expose the metadata
exports.command = {
  arguments: '-d',
  description: 'Initialize segment with ArcGIS credentials'
};

var _layerName = "Segment" + Math.floor(Math.random(10000)*10000);

function createService(_owner) {
	// console.log(".createService")
	return service.create({user: _owner, name: _layerName});
};

var user,service;
function initService() {
	// console.log(".initService")

	user = new User({token: _config.token, portal: _config.host});
	service = new Service({token: _config.token, portal: _config.host});
	return user.find(_config.username)
	          .then(createService)
	          .catch(function(error) {
	            console.log("Error", error);
	          })  
}
function writeConfig() {
	fs.writeFile(_configFile, JSON.stringify(_config), function() {
		console.log("Initialized Segment repository at ", _config.service);
	})
}
// 2. Make sure it only runs when it's directly called:
if (require.main === module) {

	program
	  .version('0.0.1')
	  .option('-u, --user [user]', 'ArcGIS username')
	  .option('-p, --password [password]', 'ArcGIS password')
	  .option('-h, --host [host]', 'ArcGIS Portal URL', 'http://www.arcgis.com/sharing/rest')
	  .option('-s, --service [service]', 'ArcGIS Service with Replication')
	  .option('-t, --token [token]', 'ArcGIS token', "")
	  .parse(process.argv);

	if (program.user) _config.username = program.user;
	if (program.password) _config.password = program.password;
	if (program.host) _config.host = program.host;
	if (program.token) _config.token = program.token;

	if (program.service) {
		_config.service = program.service;
		writeConfig();
	} else {
		initService().then(function(s) {
			_config.service = s.url;
			writeConfig();
		});
	}
}
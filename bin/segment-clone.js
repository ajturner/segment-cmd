#!/usr/bin/env node
// var segment = require('segment');
var User = require('segment/dist/node/user');
var Service = require('segment/dist/node/service');
var fs = require('fs');
var program = require('commander');

var program = require('commander');
var _configFile = "segment.json";
var _config = {};

exports.command = {
  arguments: '',
  description: ''
};

program
  .version('0.0.1')
  .option('-s, --service [service]', 'clone the arcgis service')
  .parse(process.argv);


function writeConfig() {
	fs.writeFile(_configFile, JSON.stringify(_config), function() {
		console.log("Initialized Segment repository at ", _config.service);
	})
}

// 2. Make sure it only runs when it's directly called:
if (require.main === module) {
  	_config = JSON.parse(fs.readFileSync(_configFile));
  	console.log("Cloning ",program.service);
	if (program.service) {
		_config.service = program.service;
		writeConfig();
	}
}
var Accessory, Service, Characteristic, UUIDGen;

const fs = require('fs');
const packageFile = require("./package.json");
const mcp9808 = require('mcp9808-temperature-sensor');

module.exports = function(homebridge) {
	if(!isConfig(homebridge.user.configPath(), "accessories", "MCP9808Temperature")) {
		return;
	}

	Accessory = homebridge.platformAccessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	UUIDGen = homebridge.hap.uuid;

	homebridge.registerAccessory('homebridge-mcp9808-temperature', 'MCP9808Temperature', MCP9808Temperature);
}

function isConfig(configFile, type, name) {
	var config = JSON.parse(fs.readFileSync(configFile));
	if("accessories" === type) {
		var accessories = config.accessories;
		for(var i in accessories) {
			if(accessories[i]['accessory'] === name) {
				return true;
			}
		}
	} else if("platforms" === type) {
		var platforms = config.platforms;
		for(var i in platforms) {
			if(platforms[i]['platform'] === name) {
				return true;
			}
		}
	} else {
	}

	return false;
}

function MCP9808Temperature(log, config) {
	if(null == config) {
		return;
	}

	this.log = log;
	this.name = config["name"];

	if(config["updateInterval"] && config["updateInterval"] > 0) {
		this.updateInterval = config["updateInterval"];
	} else {
		this.updateInterval = null;
	}
}

MCP9808Temperature.prototype = {
	getServices: function() {
		var that = this;

		var infoService = new Service.AccessoryInformation();
		infoService
			.setCharacteristic(Characteristic.Manufacturer, "EmielLensink")
			.setCharacteristic(Characteristic.Model, "A")
			.setCharacteristic(Characteristic.SerialNumber, "Undefined")
			.setCharacteristic(Characteristic.FirmwareRevision, packageFile.version);

		var mcp9808Service = new Service.TemperatureSensor(that.name);
		var currentTemperatureCharacteristic = mcp9808Service.getCharacteristic(Characteristic.CurrentTemperature);
		
		function updateCurrentTemperature() {
			var promise = new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve(25);
				}, 500);
			})
	
			promise.then(temperature => {
				currentTemperatureCharacteristic.updateValue(temperature);
			}).catch(that.log.debug);
			
			
			
//			mcp9808.open().then(sensor => {
				
				
				
				
//			}).catch(that.log.debug);
			
			
//			var data = fs.readFileSync(that.readFile, "utf-8");
//			var temperatureVal = parseFloat(data) / that.multiplier;
//			that.log.debug("update currentTemperatureCharacteristic value: " + temperatureVal);
			//return temperature;
		}
		
		//currentTemperatureCharacteristic.updateValue(getCurrentTemperature());
		
		if(that.updateInterval) {
			setInterval(() => {
				updateCurrentTemperature();
				//currentTemperatureCharacteristic.updateValue(getCurrentTemperature());
			}, that.updateInterval);
		}
		currentTemperatureCharacteristic.on('get', (callback) => {
			callback(null, getCurrentTemperature());
		});

		return [infoService, mcp9808Service];
	}
}


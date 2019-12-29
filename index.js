var Accessory, Service, Characteristic, UUIDGen;

const fs = require('fs');
const packageFile = require('./package.json');
const mcp9808 = require('mcp9808-temperature-sensor');

module.exports = function(homebridge) {
	if(!isConfig(homebridge.user.configPath(), 'accessories', 'MCP9808Temperature')) {
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
	if('accessories' === type) {
		var accessories = config.accessories;
		for(var i in accessories) {
			if(accessories[i]['accessory'] === name) {
				return true;
			}
		}
	} else if('platforms' === type) {
		var platforms = config.platforms;
		for(var i in platforms) {
			if(platforms[i]['platform'] === name) {
				return true;
			}
		}
	}

	return false;
}

function MCP9808Temperature(log, config) {
	if(null == config) {
		return;
	}

	this.log = log;
	this.name = config['name'];

	if(config['updateInterval'] && config['updateInterval'] > 0) {
		this.updateInterval = config['updateInterval'];
	} else {
		this.updateInterval = null;
	}
}

MCP9808Temperature.prototype = {
	getServices: function() {
		var that = this;

		var infoService = new Service.AccessoryInformation();
		infoService
			.setCharacteristic(Characteristic.Manufacturer, 'Emiel Lensink')
			.setCharacteristic(Characteristic.Model, 'Thermo One')
			.setCharacteristic(Characteristic.SerialNumber, '1')
			.setCharacteristic(Characteristic.FirmwareRevision, packageFile.version);

		var mcp9808Service = new Service.TemperatureSensor(that.name);
		var currentTemperatureCharacteristic = mcp9808Service.getCharacteristic(Characteristic.CurrentTemperature);
		currentTemperatureCharacteristic.props.minValue = -50;
		
		function temperaturePromise() {
			var promise = new Promise((resolve, reject) => {
				mcp9808.open().then(sensor => {
					sensor
					.temperature()
					.then(temp => resolve(temp.celsius))
					.then(_ => sensor.close());
				}).catch(error => {
					reject();
				});
			})
			
			return promise;
		}
		
		
		function updateCurrentTemperature() {
			var promise = temperaturePromise()
	
			promise.then(temperature => {
				currentTemperatureCharacteristic.updateValue(temperature);
			}).catch(that.log.debug);
		}
				
		if(that.updateInterval) {
			setInterval(() => {
				updateCurrentTemperature();
			}, that.updateInterval);
		}

		currentTemperatureCharacteristic.on('get', (callback) => {
			var promise = temperaturePromise()
	
			promise.then(temperature => {
				callback(null, temperature);
			}).catch(error => {
				callback(null, 0);
			});
		});

		return [infoService, mcp9808Service];
	}
}


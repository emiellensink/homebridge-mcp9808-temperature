# homebridge-mcp9808-temperature
A homebridge plug-in for the MCP9808 temperature sensor

This Homebridge plug-in can read the temperature from an MCP9808 temperature sensor. 
I use it with an Adafruit sensor (https://www.adafruit.com/product/1782) with default settings.

# license
MIT, do with it what you want. It is 'works for me' quality code and I don't feel like supporting this. That's also the reason the plug-in is not published to NPM. 

# notes
If you want to install this plug-in globally (npm install -g), you need to run 'npm config set unsafe-perm true', or the dependency will fail to compile.

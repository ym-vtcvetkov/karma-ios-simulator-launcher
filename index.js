"use strict";
const exec = require('child_process').exec;
const log = require('karma/lib/logger').create('launcher:MobileSafari');
const async = require('marcosc-async');

var MobileSafari = function(baseBrowserDecorator) {
  if(process.platform !== "darwin"){
    log.error("This launcher only works in MacOS.");
    this._process.kill();
    return;
  }
  baseBrowserDecorator(this);
  this._start = function(url) {
    this._execCommand(this._getCommand(), []);
    // Wait till Simulator is ready ~2sec as there is no IPC "ready" message :(
    setTimeout(() => {
      const cmd = `xcrun simctl openurl booted ${url}`;
      toExecPromise(cmd).catch(attemptToRecover.bind(this));
    }, 2000);
  };
};

function toExecPromise(cmd) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`Command took too long: ${cmd}`));
      proc.kill("SIGTERM");
    }, 20000);
    const proc = exec(cmd, (err, stdout) => {
      clearTimeout(id);
      if (err) {
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

function toWarnAboutShutDown(device) {
  log.warn(`Shutting down a custom iOS virtual device: ${device.name} ${device.uuid}`);
  return device;
}

function toShowBootedDevices(device) {
  log.info(`iOS virtual device is booted: ${device.name} ${device.uuid}`);
  return device;
}

function attemptToRecover(err) {
  return async.task(function * () {
    log.warn(`Problem starting simulator. Attempting to recover. Please wait ~30sec!`);
    // Let's try to kill booted custom instances
    try {
      const data = yield toExecPromise("xcrun simctl list");
      yield processData.bind(this)(data);
    } catch (err) {
      console.log("attemptToRecover", err);
    }
    this._process.kill();
  }, this);
}

function processData(data) {
  return async.task(function * () {
    var standardDevices = /^(iPhone|iPad|Apple)/;
    var commands = findBootedDevices(data)
      .sort(
        (deviceA, deviceB) => deviceA.name.localeCompare(deviceB.name)
      )
      .map(
        toShowBootedDevices
      )
      .filter(
        device => !standardDevices.test(device.name)
      )
      .map(
        toWarnAboutShutDown
      )
      .map(
        device => `xcrun simctl shutdown ${device.uuid}`
      );
    for (const cmd of commands) {
      try {
        yield toExecPromise(cmd);
      } catch (err) {
        log.error(err);
      }
    }
  });
}

function findBootedDevices(data) {
  // We are going to exclude Apple's default Devices, and separators
  var captureName = /^[A-Za-z0-9_ ]+/;
  var captureUUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  var foundDevices = data
    .split("\n")
    .filter(
      device => !device.startsWith("--") || device.startsWith("==")
    )
    .map(
      line => line.trim()
    )
    .filter(
      device => device.endsWith("(Booted)")
    )
    .map(
      device => {
        return {
          name: device.match(captureName)[0].trim(),
          uuid: device.match(captureUUID)[0]
        };
      });
  return foundDevices;
}

MobileSafari.prototype = {
  name: 'MobileSafari',
  DEFAULT_CMD: {
    darwin: 'echo "The simulator should be preopened"',
  },
  ENV_CMD: null,
};

MobileSafari.$inject = ['baseBrowserDecorator'];

module.exports = {
  'launcher:MobileSafari': ['type', MobileSafari]
};
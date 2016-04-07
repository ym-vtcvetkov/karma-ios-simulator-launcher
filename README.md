# karma-ios-simulator-launcher
Launches the iOS simulator on MacOS and runs your test in Mobile Safari.

## Installation
**Note, this plugin requires Node version 4.0 or higher.**
You can check your node version by typing `node --version`.

Make sure you have installed the latest XCode, which you can get from the AppStore.

```json
npm install --save-dev karma-ios-simulator-launcher
```

## Karma configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    browsers: ['MobileSafari']
  });
};
```

You can CLI also launch it via the command line with:

```bash
karma start --browsers MobileSafari
```


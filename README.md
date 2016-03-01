# karma-ios-simulator-launcher

Launches the iOS simulator on MacOS and runs your test in MobileSafari.

## Installation
Make sure you have installed the lastest XCode, which you can get from the AppStore.

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


'use strict';

/**
 * trying to understand what is happening in confit
 * https://github.com/krakenjs/confit/blob/3.x/lib/provider.js#L29
 */

const Hoek = require('@hapi/hoek');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

for (let key of Object.keys(args)) {
  console.log(key, args[key]);
}

// node minimist --xyz=asdf --x.z.a 123

const defaults = {
  x: {
    y: [
      {
        a: 'default'
      }
    ]
  }
}

const result = Hoek.applyToDefaults(defaults, args);

console.dir({ result }, { depth: null });
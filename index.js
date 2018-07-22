'use strict';

const Funnel = require('broccoli-funnel');
const klaw = require('klaw');
const denodeify = require('denodeify');
const readFile = denodeify(require('fs').readFile);

class ContentFunnel extends Funnel {
  constructor(inputNode, options = {}) {
    let _options = {
      annotation: options.annotation
    };
    if (options.include) {
      _options.include = [];
    } else {
      _options.exclude = [];
    }
    super(inputNode, _options);

    this.options = options;
  }

  build() {
    let [inputPath] = this.inputPaths;
    let {
      callback
    } = this.options;

    let option = this.options.include ? 'include' : 'exclude';
    let type = typeof this.options[option];

    this[option] = [];

    return new Promise(resolve => {
      let promises = [];
      klaw(inputPath)
        .on('data', item => {
          if (item.stats.isDirectory()) {
            return;
          }
          let promise;
          if (type === 'function') {
            promise = Promise.resolve(this.options[option](item.path));
          } else {
            promise = readFile(item.path, 'utf8').then(source => {
              if (type === 'string') {
                return source.indexOf(this.options[option]) !== -1;
              }
              return this.options[option].test(source);
            });
          }
          promise = promise.then(result => {
            if (result) {
              this[option].push(item.path.substr(inputPath.length + 1));
            }
          });
          promises.push(promise);
        })
        .on('end', () => {
          resolve(Promise.all(promises));
        });
    }).then(() => {
      if (callback && this[option].length) {
        callback();
      }
      super.build();
    });
  }
}

module.exports = ContentFunnel;

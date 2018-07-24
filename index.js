'use strict';

const Funnel = require('broccoli-funnel');
const klaw = require('klaw');
const denodeify = require('denodeify');
const fs = require('fs');
const readFile = denodeify(fs.readFile);

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
          promises.push(Promise.resolve().then(() => {
            if (type === 'function') {
              return this.options[option](item.path);
            }
            return readFile(item.path, 'utf8').then(source => {
              if (type === 'string') {
                return source.indexOf(this.options[option]) !== -1;
              }
              return this.options[option].test(source);
            });
          }).then(result => {
            if (result) {
              this[option].push(item.path.substr(inputPath.length + 1));
            }
          }));
        })
        .on('end', () => {
          resolve(Promise.all(promises));
        });
    }).then(() => {
      super.build();
    });
  }
}

module.exports = ContentFunnel;

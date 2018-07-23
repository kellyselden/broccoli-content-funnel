'use strict';

const { createBuilder, createTempDir } = require('broccoli-test-helper');
const co = require('co');
const { expect } = require('chai');
const ContentFunnel = require('..');
const fs = require('fs');

describe('ContentFunnel', function() {
  let input, output;

  beforeEach(co.wrap(function * () {
    input = yield createTempDir();
  }));

  afterEach(co.wrap(function * () {
    yield input.dispose();
    yield output.dispose();
  }));

  function funnel(options) {
    let subject = new ContentFunnel(input.path(), options);

    output = createBuilder(subject);
  }

  describe('include', function() {
    describe('string', function() {
      it('works', co.wrap(function * () {
        funnel({
          include: 'define('
        });

        input.write({
          'amd.js': `define(function() {})`,
          'es6.js': `export default 1`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({
          'amd.js': `define(function() {})`
        });

        yield output.build();

        expect(output.changes()).to.deep.equal({});
      }));

      it('walks dirs', co.wrap(function * () {
        funnel({
          include: 'define('
        });

        input.write({
          'lib': {
            'amd.js': `define(function() {})`
          },
          'es6.js': `export default 1`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({
          'lib': {
            'amd.js': `define(function() {})`
          }
        });

        yield output.build();

        expect(output.changes()).to.deep.equal({});
      }));

      it('rebuilds', co.wrap(function * () {
        funnel({
          include: 'define('
        });

        input.write({
          'amd.js': `define(function() {})`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({
          'amd.js': `define(function() {})`
        });

        input.write({
          'amd.js': `export default 1`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({});

        expect(output.changes()).to.deep.equal({
          'amd.js': `unlink`
        });
      }));
    });

    describe('regex', function() {
      it('works', co.wrap(function * () {
        funnel({
          include: /^define\(/
        });

        input.write({
          'amd.js': `define(function() {})`,
          'es6.js': `export default 1`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({
          'amd.js': `define(function() {})`
        });

        yield output.build();

        expect(output.changes()).to.deep.equal({});
      }));
    });

    describe('function', function() {
      it('handles sync', co.wrap(function * () {
        funnel({
          include(filePath) {
            let string = fs.readFileSync(filePath, 'utf8');
            return /^define\(/.test(string);
          }
        });

        input.write({
          'amd.js': `define(function() {})`,
          'es6.js': `export default 1`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({
          'amd.js': `define(function() {})`
        });

        yield output.build();

        expect(output.changes()).to.deep.equal({});
      }));
    });

    it('handles async', co.wrap(function * () {
      funnel({
        include(filePath) {
          let string = fs.readFileSync(filePath, 'utf8');
          return Promise.resolve(/^define\(/.test(string));
        }
      });

      input.write({
        'amd.js': `define(function() {})`,
        'es6.js': `export default 1`
      });

      yield output.build();

      expect(output.read()).to.deep.equal({
        'amd.js': `define(function() {})`
      });

      yield output.build();

      expect(output.changes()).to.deep.equal({});
    }));
  });

  describe('exclude', function() {
    describe('string', function() {
      it('works', co.wrap(function * () {
        funnel({
          exclude: 'export '
        });

        input.write({
          'amd.js': `define(function() {})`,
          'es6.js': `export default 1`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({
          'amd.js': `define(function() {})`
        });

        yield output.build();

        expect(output.changes()).to.deep.equal({});
      }));

      it('walks dirs', co.wrap(function * () {
        funnel({
          exclude: 'export '
        });

        input.write({
          'lib': {
            'amd.js': `define(function() {})`
          },
          'es6.js': `export default 1`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({
          'lib': {
            'amd.js': `define(function() {})`
          }
        });

        yield output.build();

        expect(output.changes()).to.deep.equal({});
      }));

      it('rebuilds', co.wrap(function * () {
        funnel({
          exclude: 'export '
        });

        input.write({
          'amd.js': `define(function() {})`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({
          'amd.js': `define(function() {})`
        });

        input.write({
          'amd.js': `export default 1`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({});

        expect(output.changes()).to.deep.equal({
          'amd.js': `unlink`
        });
      }));
    });

    describe('regex', function() {
      it('works', co.wrap(function * () {
        funnel({
          exclude: /^export /
        });

        input.write({
          'amd.js': `define(function() {})`,
          'es6.js': `export default 1`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({
          'amd.js': `define(function() {})`
        });

        yield output.build();

        expect(output.changes()).to.deep.equal({});
      }));
    });

    describe('function', function() {
      it('handles sync', co.wrap(function * () {
        funnel({
          exclude(filePath) {
            let string = fs.readFileSync(filePath, 'utf8');
            return /^export /.test(string);
          }
        });

        input.write({
          'amd.js': `define(function() {})`,
          'es6.js': `export default 1`
        });

        yield output.build();

        expect(output.read()).to.deep.equal({
          'amd.js': `define(function() {})`
        });

        yield output.build();

        expect(output.changes()).to.deep.equal({});
      }));
    });

    it('handles async', co.wrap(function * () {
      funnel({
        exclude(filePath) {
          let string = fs.readFileSync(filePath, 'utf8');
          return Promise.resolve(/^export /.test(string));
        }
      });

      input.write({
        'amd.js': `define(function() {})`,
        'es6.js': `export default 1`
      });

      yield output.build();

      expect(output.read()).to.deep.equal({
        'amd.js': `define(function() {})`
      });

      yield output.build();

      expect(output.changes()).to.deep.equal({});
    }));
  });
});

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'node'
  ],
  extends: [
    'sane',
    'plugin:node/recommended'
  ],
  env: {
    es6: true,
    node: true
  },
  overrides: [
    {
      files: ['test/**/*-test.js'],
      plugins: [
        'mocha'
      ],
      env: {
        mocha: true
      },
      rules: {
        'mocha/no-exclusive-tests': 'error',
        'mocha/no-identical-title': 'error',

        'quotes': 0
      }
    }
  ]
};

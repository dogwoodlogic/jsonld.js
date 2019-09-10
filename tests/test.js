/**
 * Node.js test runner for jsonld.js.
 *
 * Use environment vars to control:
 *
 * Set dirs, manifests, or js to run:
 *   JSONLD_TESTS="r1 r2 ..."
 * Output an EARL report:
 *   EARL=filename
 * Output EARL environment description (any appropraite string):
 *   EARL_ENV='CPU=Intel-i7-4790K@4.00GHz,Node.js=v10.16.3,jsonld.js=v1.7.0'
 * Bail with tests fail:
 *   BAIL=true
 * Verbose skip reasons:
 *   VERBOSE_SKIP=true
 * Benchmark mode:
 *   Basic:
 *   JSONLD_BENCHMARK=1
 *   With options:
 *   JSONLD_BENCHMARK=key1=value1,key2=value2,...
 *
 * @author Dave Longley
 * @author David I. Lehn
 *
 * Copyright (c) 2011-2019 Digital Bazaar, Inc. All rights reserved.
 */
const assert = require('chai').assert;
const benchmark = require('benchmark');
const common = require('./test-common');
const fs = require('fs-extra');
const jsonld = require('..');
const path = require('path');

const entries = [];

if(process.env.JSONLD_TESTS) {
  entries.push(...process.env.JSONLD_TESTS.split(' '));
} else {
  const _top = path.resolve(__dirname, '..');

  // json-ld-api main test suite
  const apiPath = path.resolve(_top, 'test-suites/json-ld-api/tests');
  if(fs.existsSync(apiPath)) {
    entries.push(apiPath);
  } else {
    // default to sibling dir
    entries.push(path.resolve(_top, '../json-ld-api/tests'));
  }

  // json-ld-framing main test suite
  const framingPath = path.resolve(_top, 'test-suites/json-ld-framing/tests');
  if(fs.existsSync(framingPath)) {
    entries.push(framingPath);
  } else {
    // default to sibling dir
    entries.push(path.resolve(_top, '../json-ld-framing/tests'));
  }

  /*
  // TODO: use json-ld-framing once tests are moved
  // json-ld.org framing test suite
  const framingPath = path.resolve(
    _top, 'test-suites/json-ld.org/test-suite/tests/frame-manifest.jsonld');
  if(fs.existsSync(framingPath)) {
    entries.push(framingPath);
  } else {
    // default to sibling dir
    entries.push(path.resolve(
      _top, '../json-ld.org/test-suite/tests/frame-manifest.jsonld'));
  }
  */

  // json-ld.org normalization test suite
  const normPath = path.resolve(_top, 'test-suites/normalization/tests');
  if(fs.existsSync(normPath)) {
    entries.push(normPath);
  } else {
    // default up to sibling dir
    entries.push(path.resolve(_top, '../normalization/tests'));
  }

  // other tests
  entries.push(path.resolve(_top, 'tests/misc.js'));
  entries.push(path.resolve(_top, 'tests/graph-container.js'));
  entries.push(path.resolve(_top, 'tests/node-document-loader-tests.js'));
}

let benchmarkOptions = null;
if(process.env.JSONLD_BENCHMARK) {
  benchmarkOptions = {};
  if(!(['1', 'true'].includes(process.env.JSONLD_BENCHMARK))) {
    process.env.JSONLD_BENCHMARK.split(',').forEach(pair => {
      const kv = pair.split('=');
      benchmarkOptions[kv[0]] = kv[1];
    });
  }
}

const options = {
  nodejs: {
    path
  },
  assert,
  benchmark,
  jsonld,
  exit: code => process.exit(code),
  earl: {
    id: 'Node.js',
    env: process.env.EARL_ENV,
    filename: process.env.EARL
  },
  verboseSkip: process.env.VERBOSE_SKIP === 'true',
  bailOnError: process.env.BAIL === 'true',
  entries,
  benchmarkOptions,
  readFile: filename => {
    return fs.readFile(filename, 'utf8');
  },
  writeFile: (filename, data) => {
    return fs.outputFile(filename, data);
  },
  import: f => require(f)
};

// wait for setup of all tests then run mocha
common(options).then(() => {
  run();
}).catch(err => {
  console.error(err);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

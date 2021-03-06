# davila.js

Interactive, Iterative Schema Documentation

[![Build Status](https://travis-ci.org/Princeton-CDH/davilajs.svg?branch=main)](https://travis-ci.org/Princeton-CDH/davilajs)
[![codecov](https://codecov.io/gh/Princeton-CDH/davilajs/branch/master/graph/badge.svg)](https://codecov.io/gh/Princeton-CDH/davilajs)

davila.js will be a complete reimplementation of [DAVILA](https://github.com/jabauer/DAVILA/), an interactive schema annotation tool, built in [Processing](https://processing.org/) and released in 2010.  The new version will be a browser-based tool with interactive customization features.

This repo uses [git-flow](https://github.com/nvie/gitflow) conventions; **master**
contains the most recent release, and work in progress will be on the **develop** branch.
Pull requests should be made against develop.

# Usage instructions

* Find or generate your schema (currently only supports MySQL).  To export
  a schema from an existing database: `mysqldump -u root -p --no-data dbname > schema.sql`

* Navigate to [https://princeton-cdh.github.io/davilajs/](https://princeton-cdh.github.io/davilajs/)
  (current in-progress prototype), and drag your schema onto the drop zone on the page.

* View and interact with a visualization of the entities and relationships
  in your schema.


# Development instructions

## Initial setup and installation

* Make sure you are starting on the development branch `git checkout develop`

* Install [jekyll using bundler](https://jekyllrb.com/docs/quickstart/), which is currently
used for running davila.js and unit tests in the browser: `gem install jekyll bundler`

* Download [nodejs](https://nodejs.org/en/download/) pkg and install

* Install local npm dependencies for unit testing: `npm install`

* Make sure your jekyll `_config.yml` file has a an empty `baseurl`
  configured for development.

* Run jekyll: `bundle exec jekyll serve`

* Navigate to http://localhost:4000/test/ or run tests via `mocha` on
  the command line.

* If all tests run, then navigate to http://localhost:4000/ to use davilajs

## Unit tests

Tests are written with [mocha](https://mochajs.org/), [chai](http://www.chaijs.com/),
and [sinon](http://sinonjs.org/) and can be run in the browser or on the command line.

To run them in the browser, start jekyll and navigate to
http://localhost:4000/test/

To run them on the command line, use `mocha`.







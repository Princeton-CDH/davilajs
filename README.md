# davila.js

Interactive, Iterative Schema Documentation

davila.js will be a complete reimplementation of [DAVILA](https://github.com/jabauer/DAVILA/), an interactive schema annotation tool, built in [Processing](https://processing.org/) and released in 2010.  The new version will be a browser-based tool with interactive customization features.

This repo uses [git-flow](https://github.com/nvie/gitflow) conventions; **master**
contains the most recent release, and work in progress will be on the **develop** branch.
Pull requests should be made against develop.


# Development instructions

## Initial setup and installation

* Make sure you are starting on the Development Branch `git checkout develop`

* Install [jekyll using bundler](https://jekyllrb.com/docs/quickstart/), which is currently
used for running davila.js and unit tests in the browser: `gem install jekyll bundler`

* Download [nodejs] (https://nodejs.org/en/download/) pkg and install

* Install local npm dependencies for unit testing: `npm install`

* Run jekyll: `bundle exec jekyll serve`

* Navigate to http://localhost:4000/test/ 

* if all tests run, then navigate to http://localhost:4000/ to use davilajs

## Unit tests

Tests are written with mocha and chai and currently run through the browser.
To run them, start jekyll and navigate to http://localhost:4000/test/







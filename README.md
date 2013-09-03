Angular Charts
==============

_Charts for AngularJS_


##Getting started

###Step 1: View the example page

After cloning the repository, you can view an example page by opening the `examples/index.html` page in your browser.

This page tests that Angular Charts is working correctly and shows the available chart types.


### Step 2: Use Angular Charts in your own project

The `dist/js` and `dist/css` directories contain the compiled JavaScript and CSS files.

Minified and unminified versions are included to allow both production and debugging use.

To use Angular Charts in your own project, you will need to include the following scripts in your HTML source:

1. [AngularJS](http://angularjs.org/) (v1.2 or higher)
2. `angular-charts.min.js` or `angular-charts.js` (from the `dist/js` directory of the repository)
3. `angular-charts.min.css` or `angular-charts.css` (from the `dist/css` directory of the repository)

Detailed documentation on using the individual chart types is not yet available. In the meantime you can refer to the example page's HTML source for an example of the chart markup.


## Building from source

The Angular Charts source code is written in JS and SASS, and can be found in the `src` directory within the repository.

If you make any changes to the source code, you will need to rebuild the JS and CSS in order to update the files in the `dist` directory.

###Build process requirements

To build Angular Charts, you will need the following software installed on your computer:

- [Node.js](http://nodejs.org/) v0.8.0 or higher
- The [SASS](http://sass-lang.com/download.html) Ruby Gem


###First build

To perform the initial build, navigate to the repository's root directory and run the following command:

	npm install

This will install the dependencies required to build Angular Charts, and perform the initial build.

Generated JS and CSS will be placed in the `dist` directory.


###Subsequent builds

Once you have performed the initial build, subsequent builds can be performed by navigating to the repository's root directory and running the following command:

	npm start

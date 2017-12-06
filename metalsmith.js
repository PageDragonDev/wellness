var Metalsmith  = require('metalsmith');
var stylus = require('metalsmith-stylus');
var markdown    = require('metalsmith-markdown');
var collections = require('metalsmith-collections');
var layouts     = require('metalsmith-layouts');
var permalinks  = require('metalsmith-permalinks');
var msif = require('metalsmith-if');
var watch = require('metalsmith-watch');
var serve = require('metalsmith-serve');
var markdownBlocks = require('./plugins/markdown-blocks.js')
var moment = require("moment");
var excerpts = require('metalsmith-better-excerpts');
var marked = require('marked');
var categories = require('./plugins/metalsmith-categories.js');

Metalsmith(__dirname) 

.source('./src')    // source directory
.destination('./build') // destination directory
.clean(true)    // clean destination before
.metadata({
    moment: moment,
    marked: marked
})
.use(collections({
    raves: {
        date: 'date',
        reverse: true,
        pattern: "**/_raves/*.md"
    },
    news: {
        // date: 'date',
        // reverse: true,
        pattern: "**/_news/*.md"
    },
    buy: {
        // date: 'date',
        // reverse: true,
        pattern: "**/_buy/*.md"
    }
})) // use `collections.posts` in layouts
.use(markdown())   // transpile all md into html
.use(categories({path:"category/"}))
.use(categories({path:"service/", list:"services"}))
.use(permalinks({           // change URLs to permalink URLs
    relative: false           // put css only in /css
  }))
.use(stylus())
.use(layouts({ // wrap layouts around html
    engine: 'ejs', // use the layout engine you like
    partials: "partials",
    partialExtension: ".ejs",
    default: "layout.ejs",
    pattern: "**/*.html"
}))
.use(msif(process.env.ENV !== 'prod',watch({
        paths: {
            "${source}/**/*": true,
            "layouts/**/*": "**/*.md",
        },
        livereload: process.env.ENV !== 'prod',
    })))
    .use(msif(process.env.ENV !== 'prod',serve({
        host: "0.0.0.0",
        port: 8080,
        verbose: true
    })))
.build(function(err) {      // build process
    if (err) throw err;       // error handling is required
  });
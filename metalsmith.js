/* eslint-disable */

const Metalsmith = require('metalsmith');
const stylus = require('metalsmith-stylus');
const markdown = require('metalsmith-markdown');
const collections = require('metalsmith-collections');
const layouts = require('metalsmith-layouts');
const permalinks = require('metalsmith-permalinks');
const msif = require('metalsmith-if');
const watch = require('metalsmith-watch');
const serve = require('metalsmith-serve');
const moment = require('moment');
const excerpts = require('metalsmith-better-excerpts');
const marked = require('marked');
const data = require('metalsmith-data');
const _ = require('lodash');
const slug = require('slug');

console.log('ENV:',process.env.ENV);

Metalsmith(__dirname)
    .source('./src') // source directory
    .destination('./build') // destination directory
    .clean(true) // clean destination before
    .metadata({
        moment,
        marked,
        _:_,
        slug: slug,
    })
    .use(data({}))
    .use(collections({
        services: {
            date: 'date',
            reverse: true,
            pattern: "**/services/*.md"
        },
        videos: {
            date: 'date',
            reverse: true,
            pattern: "**/videos/*.md"
        },
        posts: {
            date: 'date',
            reverse: true,
            pattern: "**/posts/*.md"
        },
    })) // use `collections.posts` in layouts
    .use(markdown({gfm: true, breaks: true, tables: true})) // transpile all md into html
    .use(permalinks({ // change URLs to permalink URLs
        relative: false, // put css only in /css
    }))
    .use(stylus())
    .use(layouts({ // wrap layouts around html
        directory: "layouts",
        engine: 'ejs', // use the layout engine you like
        partials: 'partials',
        partialExtension: '.ejs',
        default: 'layout.ejs',
        pattern: '**/*.html',
        suppressNoFilesError: true,
    }))
    .use(msif(process.env.ENV !== 'prod', watch({
        paths: {
            '${source}/**/*': true,
            'layouts/**/*': '**/*.md',
        },
        livereload: process.env.ENV !== 'prod',
    })))
    .use(msif(process.env.ENV !== 'prod', serve({
        host: '0.0.0.0',
        port: 8080,
        verbose: true,
    })))
    .build((err) => { // build process
        if (err) {
            console.log(err);
        } // error handling is required
    });

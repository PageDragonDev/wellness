const _ = require('lodash');
const slug = require('slug');

const categories = function(_opts) {    // eslint-disable-line
    const opts = _.defaults(_opts || {}, {
        path: 'category/', layout_type: 'category', list: 'categories', posts: 'posts',
    });

    return function (files, metalsmith, done) { // eslint-disable-line
        const meta = metalsmith.metadata();
        const { list } = opts;

        // loop through all files, building an object with data about all categories
        const categories = _.reduce(files, (memo, file, path) => {  // eslint-disable-line
            // make sure all categories are lower case, to prevent distinction between `Backbone` and `backbone`.

            const catTitles = {};
            if (file[list]) {
                file[list] = file[list].map((t) => {
                    const catSlug = slug(t).toLowerCase();
                    catTitles[catSlug] = t;
                    return catSlug;
                });
            } else {
                file[list] = [];
            }

            // loop through all categories found in the `categories` YAML data for this file
            _.each(file[list], (category) => {
                // build a path for where the file for this category is supposed to go
                const key = `${opts.path + category}/index.html`;
                memo[key] = _.defaults({}, memo[key], {
                    path: key, category, contents: '', title: catTitles[category], layout_type: opts.layout_type,
                });

                if (!memo[key][opts.posts]) { memo[key][opts.posts] = []; }
                memo[key][opts.posts] = _.sortBy(memo[key][opts.posts].concat(file), 'date').reverse();
            });
            return memo;
        }, {});

        // add this data to the files object, causing Metalsmith to create these files
        _.extend(files, categories);

        // add a taglist array to the metadata, to be consumed by a tagcloud type page
        let taglist = _.reduce(categories, (memo, tag) => memo.concat({
            tag: tag.title, path: tag.path, count: tag.posts.length, posts: tag.posts,
        }), []);
        taglist = _.sortBy(taglist, t => t.tag);

        if (!meta[`_${list}`]) {
            meta[`_${list}`] = taglist;
        }

        // note metalsmith that we are done!
        done();
    };
};

module.exports = categories;

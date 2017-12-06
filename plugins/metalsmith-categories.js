let _ = require("lodash");
let slug = require("slug");

let categories = function(opts) {
    opts = _.defaults(opts || {}, { path: "category/", layout_type: "category", list: "categories" });

    return function(files, metalsmith, done) {
        let meta = metalsmith.metadata();
        let list = opts.list;
        
        // loop through all files, building an object with data about all categories
        var categories = _.reduce(files, (memo, file, path) => {

            // make sure all categories are lower case, to prevent distinction between `Backbone` and `backbone`.

            let catTitles = {};
            if(file[list]) {
                file[list] = file[list].map((t) => { 
                    let catSlug = slug(t).toLowerCase();
                    catTitles[catSlug] = t;
                    return catSlug;
                });
            } else {
                file[list] = [];
            }
            
            // loop through all categories found in the `categories` YAML data for this file
            _.each(file[list], function(category) {
                // build a path for where the file for this category is supposed to go
                let key = opts.path + category + "/index.html";
                memo[key] = _.defaults({}, memo[key], { category: category, posts: [], contents: "", title: catTitles[category] }, opts.yaml);
                memo[key].posts = _.sortBy(memo[key].posts.concat(file), "date").reverse();
            });
            return memo;
        }, {});

        // add this data to the files object, causing Metalsmith to create these files
        _.extend(files, categories);

        // add a taglist array to the metadata, to be consumed by a tagcloud type page
        meta.taglist = _.sortBy(_.reduce(categories, function(memo, tag) {
            return memo.concat({ tag: tag.tag, count: tag.posts.length, posts: tag.posts });
        }, []), "count").reverse();

        // also add the same data but with tagnames as key, for use by individual tag pages
        meta.categories = _.reduce(categories, function(memo, tag) {
            memo[tag.tag] = { tag: tag.tag, count: tag.posts.length, posts: tag.posts };
            return memo;
        }, {});

        // note metalsmith that we are done!
        done();
    };
};

module.exports = categories;

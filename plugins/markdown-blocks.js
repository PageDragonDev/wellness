/**
 * Expose `plugin`.
 */
module.exports = plugin;

/**
 * Metalsmith plugin to hide drafts from the output.
 *
 * @return {Function}
 */
var markup = '<p>\:\:\:(.*)<\/p>';
var reg = new RegExp(markup, 'gm');

function plugin() {
    return function(files, metalsmith, done) {
        setImmediate(done);

        var keys = Object.keys(files);
        keys.forEach(key => {
            var file = files[key];

            if (key.endsWith(".html") == true) {
                var markdown = file.contents.toString();
                
                var returnedMarkup = markdown.replace(reg, function (raw, classNames) {
                    classNames = classNames.trim();
                
                    var ret = "";
                    if(classNames.length > 0) {
                      ret  = '<!-- Begin Markdown Style Block -->\n<div class="' + classNames + '">';
                    } else {
                      ret =  '</div>\n<!-- End Markdown Style Block -->';
                    }
                    return ret;
                });
                
                file.contents = Buffer.from(returnedMarkup, 'utf8');
            }
        });
    };
}
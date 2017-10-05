exports.fubar = function() {
    return function(){
        console.log("hey there.");
    }
}

exports.barfu = function() {
    console.log("my function")
}

exports.merg = function(r2d2, r5c6) {
    r2d2();
    r5c6();
}
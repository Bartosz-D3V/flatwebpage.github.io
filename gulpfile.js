var gulp = require("gulp"),
    sass = require("gulp-sass"),
    resetCSS = require("node-reset-scss"),
    concatCSS = require("gulp-concat-css"),
    cleanCSS = require("gulp-clean-css"),
    uncss = require("gulp-uncss"),
    combineMQ = require("gulp-combine-mq"),
    uglify = require("gulp-uglify"),
    concatJS = require("gulp-concat"),
    babel = require("gulp-babel"),
    minifyHTML = require("gulp-htmlmin"),
    imageMin = require("gulp-imagemin"),
    browserSync = require("browser-sync").create(),
    reload = browserSync.reload,
    runSequence = require("run-sequence"),
    plumber = require("gulp-plumber"),
    rename = require("gulp-rename"),
    clean = require("gulp-clean"),
    gutil = require("gulp-util"),
    deploy = require("gulp-gh-pages");

var settings = {
    distLocation: "./dist",
    indexLocation: "app/index.html",
    imagesLocation: "app/assets/images",
    scssLocation: "app/assets/scss",
    fontsLocation: "app/assets/fonts",
    concatCSSName: "bundle.css",
    concatJSName: "bundle.js"
};

//Minify & copy HTML code
gulp.task("html", function () {
    return gulp.src(settings.indexLocation)
        .pipe(plumber())
        .pipe(minifyHTML({
            'html5': true,
            'caseSensitive': false,
            'minifyURLs': true,
            'removeEmptyAttributes': true,
            'collapseWhitespace': true,
            'collapseBooleanAttributes': true,
            'removeComments': true,
            'useShortDoctype': true,
            'keepClosingSlash': true,
            'decodeEntities': true
        }))
        .pipe(gulp.dest(settings.distLocation))
        .pipe(reload({stream: true}));
});

//Concat minfied CSS libraries and copy into dist
//Compile Sass to CSS, concat, minify it and rename the result file
gulp.task("styles", function () {
    var libraries = [
        "node_modules/font-awesome/css/font-awesome.css",
        "node_modules/animate.css/animate.css",
        settings.scssLocation + "/manifest.scss"
    ];
    return gulp.src(libraries)
        .pipe(plumber(function (error) {
            gutil.log(gutil.colors.red(error.message));
            this.emit("end");
        }))
        .pipe(sass({
            includePaths: resetCSS.includePath
        }))
        .pipe(combineMQ())
        .pipe(uncss({
            html: [settings.indexLocation],
            ignore: ['animated', '.slideInUp', '.zoomInRight', '.bounceIn']
        }))
        .pipe(concatCSS(settings.concatCSSName))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(cleanCSS({
            'skip-rebase': true,
            's0': true,
            's1': true,
            'version': true
        }))
        .pipe(gulp.dest(settings.distLocation + "/css"))
        .pipe(reload({stream: true}));
});

//Transform ES6 to ES5, Concat, minify JS files & libraries and copy into dist
gulp.task("scripts", function () {
    var libraries = [
        "node_modules/waypoints/lib/noframework.waypoints.js",
        "app/js/main.js"
    ];
    return gulp.src(libraries)
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concatJS(settings.concatJSName))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(gulp.dest(settings.distLocation + "/js"))
        .pipe(reload({stream: true}));
});

//Copy & minify html5shiv for older version of the IE (IE < 9)
gulp.task("shiv", function () {
    return gulp.src("node_modules/html5shiv/dist/html5shiv.js")
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(gulp.dest(settings.distLocation + "/js"))
        .pipe(reload({stream: true}));
});

//Copy and optimize images
gulp.task("images", function () {
    return gulp.src(settings.imagesLocation + "/**/*.{jpg,jpeg,png,gif,svg,ico}")
        .pipe(plumber())
        .pipe(imageMin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(settings.distLocation + "/images"))
        .pipe(reload({stream: true}));
});

//Copy fonts
gulp.task("fonts", function () {
    return gulp.src([
        "node_modules/font-awesome/fonts/FontAwesome.otf",
        "node_modules/font-awesome/fonts/fontawesome-webfont.woff2"])
        .pipe(gulp.dest("./dist/fonts"));
});

//Browser sync
gulp.task("browserSync", function () {
    return browserSync.init({
        server: {
            baseDir: settings.distLocation,
            index: "index.html"
        }
    });
});

//Delete dist folder
gulp.task("clear", function () {
    return gulp.src(settings.distLocation)
        .pipe(clean());
});

//Build the distributable
gulp.task("build", function (callback) {
    return runSequence(["fonts", "styles", "html", "scripts", "shiv", "images"], callback)
});

//Deploy project (Used specifically for GitHub Pages)
gulp.task("deploy", ["build"], function () {
    return gulp.src("./dist/**/*")
        .pipe(deploy());
});

//Watch files for changes and refresh browser
gulp.task("watch", function () {
    gulp.watch("app/assets/scss/**/*.scss", ["styles"], browserSync.reload());
    gulp.watch("app/index.html", ["html"], browserSync.reload());
    gulp.watch("app/js/main.js", ["scripts"], browserSync.reload());
    gulp.watch("app/assets/images/**/*.{jpg,jpeg,png,gif,svg}", ["images"], browserSync.reload())
});

//Default (runnable via "gulp")
gulp.task("default", function (callback) {
    return runSequence("clear", "build", ["watch", "browserSync"], callback);
});
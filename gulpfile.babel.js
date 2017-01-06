import gulp from "gulp";
import sass from "gulp-sass";
import resetCSS from "node-reset-scss";
import concatCSS from "gulp-concat-css";
import cleanCSS from "gulp-clean-css";
import uncss from "gulp-uncss";
import combineMQ from "gulp-combine-mq";
import uglify from "gulp-uglify";
import concatJS from "gulp-concat";
import babel from "gulp-babel";
import minifyHTML from "gulp-htmlmin";
import imageMin from "gulp-imagemin";
import browserSync from "browser-sync";
const reload = browserSync.reload;
import runSequence from "run-sequence";
import plumber from "gulp-plumber";
import rename from "gulp-rename";
import clean from "gulp-clean";
import gutil from "gulp-util";
import deploy from "gulp-gh-pages";

const settings = {
    distLocation: "./dist",
    indexLocation: "app/index.html",
    imagesLocation: "app/assets/images",
    scssLocation: "app/assets/scss",
    jsLocation: "app/js",
    fontsLocation: "app/assets/fonts",
    concatCSSName: "bundle.css",
    concatJSName: "bundle.js"
};

//Copy & minify HTML5 code
gulp.task("html", () => {
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

//Copy compiled SCSS files, concat, minifiy and rename
gulp.task("styles", () => {
    const libraries = [
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
            ignore: ['animated', '.slideInUp', '.fadeIn', '.zoomIn']
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

//Copy JS files, transform ES6 to ES5, Concat and minify JS files & libraries
gulp.task("scripts", () => {
    const libraries = [
        "node_modules/waypoints/lib/noframework.waypoints.js",
        settings.jsLocation + "/main.js"
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

//Copy & minify html5shiv
gulp.task("shiv", () => {
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
gulp.task("images", () => {
    return gulp.src(settings.imagesLocation + "/**/*.{jpg,jpeg,png,gif,svg,ico}")
        .pipe(plumber())
        .pipe(imageMin({
            optimizationLevel: 7,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(settings.distLocation + "/images"))
        .pipe(reload({stream: true}));
});

//Copy fonts
gulp.task("fonts", () => {
    return gulp.src([
        "node_modules/font-awesome/fonts/FontAwesome.otf",
        "node_modules/font-awesome/fonts/fontawesome-webfont.woff2"])
        .pipe(gulp.dest("./dist/fonts"));
});

//Browser sync
gulp.task("browserSync", () => {
    return browserSync.init({
        server: {
            baseDir: settings.distLocation,
            index: "index.html"
        }
    });
});

//Delete dist folder
gulp.task("clear", () => {
    return gulp.src(settings.distLocation)
        .pipe(clean());
});

//Build the distributable
gulp.task("build", (callback) => {
    return runSequence(["fonts", "styles", "html", "scripts", "shiv", "images"], callback)
});

//Deploy project (Used specifically for GitHub Pages)
gulp.task("deploy", ["build"], () => {
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
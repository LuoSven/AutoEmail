module.exports = {
    bundle: {
        main: {
            scripts: [
                './dist/js/**/*.js',
                '!./dist/js/**/*.min.js',
            ],
            styles: './public/site/css/**/*.css'
        },
        vendor: {
            scripts: './dist/js/**/*.min.js',
        }
    },
    options:{

    }
};
module.exports = {
    appenders: {
        ruleConsole: {type: 'console'},
        ruleFile: {
            type: 'dateFile',
            // 这个目录是相对于根目录的，即与app.js 是同一级的
            filename: './logs/server-',
            pattern: 'yyyy-MM-dd.log',
            maxLogSize: 10 * 1000 * 1000,
            numBackups: 3,
            alwaysIncludePattern: true
        },
        emptyCode: {
            type: 'dateFile',
            // 这个目录是相对于根目录的，即与app.js 是同一级的
            filename: './logs/emptyCode',
            maxLogSize: 10 * 1000 * 1000,
            numBackups: 3,
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            category: "emptyCode",
            encoding: 'utf-8'
        },
        recountedPrice: {
            type: 'dateFile',
            // 这个目录是相对于根目录的，即与app.js 是同一级的
            filename: './logs/recountedPrice',
            maxLogSize: 10 * 1000 * 1000,
            numBackups: 3,
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            category: "recountedPrice",
            encoding: 'utf-8'
        }
    },
    categories: {
        default: {appenders: ['ruleConsole', 'ruleFile'], level: 'info'}
    }
}

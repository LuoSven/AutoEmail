const boolToChineseFilter = function () {

    var filter = function (input) {
        return input ? '是' : '否'
    };
    return filter;

};
const boolToHaveFilter = function () {

    var filter = function (input) {
        return input ? '有' : '无'
    };
    return filter;
};

const boolToPassFilter = function () {

    var filter = function (input) {
        return input ? '通过' : '驳回'
    };
    return filter;
};
const rmbFilter = function () {

    var filter = function (input) {
        input = input || 0
        input = input.toString()
        input = parseFloat(input);
        input = input.toFixed(2);

        return input ? '¥' + input : ''
    };
    return filter;
};

const zeroEmptyFilter = function () {

    var filter = function (input, isZeroEmpty) {
        isZeroEmpty = isZeroEmpty == undefined ? true : isZeroEmpty;
        input = input || 0
        if (input == "0") {
            if (isZeroEmpty) {
                return
            }
            return '0.00'
        }
        input = input.toString()
        input = parseFloat(input);
        input = input.toFixed(2);

        var s = input.split('.')

        if (s.length == 1) {
            input = input + '.00'
        } else if (s[1].length == 1) {
            input = input + '0'
        }
        return input
    };
    return filter;
};
const enterFilter = function () {

    var filter = function (input) {
        if (!input) {
            return '';
        }
        input = input.replace(/\r\n/g, "<br>")
        input = input.replace(/\n/g, "<br>");
        return input
    };
    return filter;
};

const brFilter = function ($sce) {

    var filter = function (input) {
        if (input) {
            input = input.toString()
        } else {
            input = '';
        }
        input = input.replaceAll('\r\n', '<br>').replaceAll('\r', '<br>').replaceAll('\n', '<br>')
        input = $sce.trustAsHtml(input)
        return input;
    };
    return filter;
};

const emptyFieldStatusFilter = function () {

    let map = {
        '-1': '忽略',
        '0': '未处理',
        '1': '已处理',
    }
    return function (input) {
        if (input) {
            input = input.toString()
        } else {
            input = '0';
        }
        let name = map[input]
        return name;
    };
};
const displayNameFilter = function () {

    var filter = function (input) {
        var name = input
        if (window.userMap) {
            name = window.userMap[name];
            name = name || input;
        }
        return name;
    };
    return filter;
};
const dmyDateRangeFilter = function () {

    var filter = function (input) {
        input = input || ''
        if (input.indexOf('-') !== -1) {
            let s = input.split('-');
            let begin = s[0].getDateFromDMY();
            let end = s[1].getDateFromDMY();

            return `${begin ? begin.format('yyyyMMdd') : '        '} - ${end ? end.format('yyyyMMdd') : '        '}`
        }

        return input;
    };
    return filter;
};

angular
    .module('piApp')
    .filter('boolToChineseFilter', boolToChineseFilter)
    .filter('boolToHaveFilter', boolToHaveFilter)
    .filter('boolToPassFilter', boolToPassFilter)
    .filter('rmbFilter', rmbFilter)
    .filter('enterFilter', enterFilter)
    .filter('brFilter', brFilter)
    .filter('zeroEmptyFilter', zeroEmptyFilter)
    .filter('emptyFieldStatusFilter', emptyFieldStatusFilter)
    .filter('displayNameFilter', displayNameFilter)
    .filter('dmyDateRangeFilter', dmyDateRangeFilter)

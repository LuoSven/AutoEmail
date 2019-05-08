function init() {


    Array.prototype.distinct = function () {
        var arr = this,
            result = [],
            i,
            j,
            len = arr.length;
        for (i = 0; i < len; i++) {
            for (j = i + 1; j < len; j++) {
                if (arr[i] === arr[j]) {
                    j = ++i;
                }
            }
            result.push(arr[i]);
        }
        return result;
    }
    Array.prototype.pagination = function (pageNo, pageSize) {
        let array = this;
        var offset = (pageNo - 1) * pageSize;
        return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    }

    Array.prototype.insertAt = function (index, obj) {
        this.splice(index, 0, obj);
    }
    Array.prototype.removeAt = function (index) {
        this.splice(index, 1);
    }
    String.prototype.firstUpperCase = function () {
        let s = this;
        let v = "";
        for (let i = 0; i < s.length; i++) {
            let value = s[i]
            if (i === 0) {
                value = value.toUpperCase()
            }
            v += value
        }
        return v

    }
    String.prototype.getDateFromDMY = function () {
        let str = this;
        if (str.length === 0) {
            return
        }

        let map = {
            "JAN": 0,
            "FEB": 1,
            "MAR": 2,
            "APR": 3,
            "MAY": 4,
            "JUN": 5,
            "JUL": 6,
            "AUG": 7,
            "SEP": 8,
            "OCT": 9,
            "NOV": 10,
            "DEC": 11
        };
        let month = map[str.substr(2, 3)];
        let year = '20' + str.substr(5, 3);
        let day = str.substr(0, 2);
        return new Date(year, month, day)

    }
    Array.prototype.remove = function (obj) {
        var index = this.indexOf(obj);
        if (index >= 0) {
            this.removeAt(index);
        }
    }
    Array.prototype.sum = function (filter) {
        var sum = 0;

        this.forEach(function (a) {
            var value = a
            if (filter) {
                value = parseFloat(filter(a))
            }

            if (isNaN(value)) {
                return
            }
            sum += value;
        })
        return sum
    }
    Array.prototype.min = function (filter) {
        var min;

        this.forEach(function (a) {
            var value = a
            if (filter) {
                value = parseFloat(filter(a))
            }

            if (isNaN(value)) {
                return
            }
            if (min === undefined) {
                min = value;
            } else {
                min = value < min ? value : min
            }

        })
        return min
    }
    Array.prototype.max = function (filter) {
        var max;

        this.forEach(function (a) {
            var value = a
            if (filter) {
                value = parseFloat(filter(a))
            }

            if (isNaN(value)) {
                return
            }
            if (max === undefined) {
                max = value;
            } else {
                max = value >max ? value : max
            }

        })
        return max
    }




    Number.prototype.toBigRmb = function (isBrank) {

        var isUnderZero = this < 0;


        isBrank = isBrank == undefined ? true : isBrank


        var n = this < 0 ? -this : this;


        if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
            return "数据非法";
        var unit = "仟佰拾亿仟佰拾万仟佰拾圆角分", str = "";
        n += "00";
        var p = n.indexOf('.');
        if (p >= 0)
            n = n.substring(0, p) + n.substr(p + 1, 2);
        unit = unit.substr(unit.length - n.length);
        for (var i = 0; i < n.length; i++) {
            str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
        }
        var result = str.replace(/零(仟|佰|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|圆)/g, "$1").replace(/(亿)万/g, "$1$2").replace(/^圆零?|零分/g, "").replace(/圆$/g, "圆整");

        if (result.indexOf('整') === -1) {
            result = result + '整'
        }
        var brankLength = 13
        if (result.length > brankLength && isBrank) {
            result = result.substring(0, brankLength) + '<br>' + result.substring(brankLength, result.length - 1);
        }
        return (isUnderZero ? '负' : '') + result;
    }

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }


//获取当月的开始时间

    Date.prototype.getMonthSpan = function (dayPlus) {
        var date = this;
        var beignDay = new Date(date.getFullYear(), date.getMonth(), 1)
        var monthNow = date.getMonth();
        var endDay = new Date(beignDay.getTime())
        if (monthNow == 11) {
            endDay.setFullYear(endDay.getFullYear() + 1)
            endDay.setMonth(0)
        } else {
            endDay.setMonth(endDay.getMonth() + 1)
        }
        endDay = new Date(endDay.getTime() - 24 * 60 * 60 * 1000);
        if (dayPlus && dayPlus != 0) {
            endDay = new Date(endDay.getTime() + dayPlus * 24 * 60 * 60 * 1000);
            beignDay = new Date(beignDay.getTime() + dayPlus * 24 * 60 * 60 * 1000);
        }
        return [beignDay, endDay]
    }


    String.prototype.replaceAll = function (s1, s2) {
        s2 = s2 || '';
        var value = this.toString();
        return value.replace(new RegExp(s1, "gm"), s2);
    }


    Array.prototype.groupBy = function (f) {
        var array = this;
        const groups = {};
        array.forEach(function (o) {
            const group = JSON.stringify(f(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });
        return Object.keys(groups).map(function (group) {
            return groups[group];
        });
    }


    Array.prototype.listsToObs = function (cols) {
        var list = this.slice(0);
        if (!cols) {
            cols = list.shift();
        }


        return loadData(list, cols)

        function loadData(list, cols) {
            var rows = [];
            list.forEach(item => {
                var ob = {}
                cols.forEach((a, i) => {
                    ob[a] = item[i];
                })
                rows.push(ob)
            })
            return rows;
        }
    }
}

module.exports = {
    init
}

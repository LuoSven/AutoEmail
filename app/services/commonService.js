let fs = require('fs');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');
var readline = require("readline");
const mongoose = require('mongoose');
let pinyin = require("pinyin");
let tables = {}
let logService = require('./logService')

let zeroFilterField = {
    lowestFare: [
        'depCountryCode',
        'arrCountryCode',
        'depCityCode',
        'arrCityCode',
    ],
    exchangeRate: ['currencyUnit'],
    footNote: ['footNote'],
    strategy_business: ['weekday', 'flight', 'benchmarkOd', 'benchmarkCxr', 'season', 'keyod', 'autocalc', 'strategyType', 'comments'],
    strategy_economy: ['weekday', 'flight', 'benchmarkOd', 'benchmarkCxr', 'season', 'keyod', 'autocalc', 'strategyType', 'comments'],
}



function apiInit(app) {
    var mainUrl = '/api/db/common/';
    //获取项目
    app.post(mainUrl + 'uploadTable', async function (req, res) {

        let table = req.body;
        let map = {}

        let tableSchema = {
            tableChineseName: table.tableChineseName,
            tableName: table.tableName,
            idRules: table.idRules,
            cols: table.cols.map(s => {
                return {
                    name: s.name,
                    type: s.type,
                    value: s.value,
                }
            })
        }
        //包含/的数据需要添加_array的字段
        let addCols = []

        tableSchema.cols = tableSchema.cols.concat(addCols)

        let tempSchema = {}
        tableSchema.cols.forEach(c => {
            tempSchema[c.value] = {type: c.type}
        })
        map[tableSchema.tableName] = tempSchema;


        //把数据同步到json
        let schema = getJson('schema')
        Object.keys(map).forEach(k => {
            schema[k] = map[k]
        })
        //预处理列
        processCol(schema, tableSchema)

        setJson('schema', schema)
        initMongoDb();


        //是否重新生成表
        let entity = tables[table.tableName];
        if (!table.isAppend) {
            await entity.deleteMany()
        }


        //预处理数据
        table.data = await processData(table.data, table.tableName)

        let now = new Date();

        table.data.forEach(o => {
            o.inputDate = now;
            o.inputDater = table.userName;
        })


        await entity.create(table.data)


        res.json({code: 1})
    });


    app.get(mainUrl + 'getTableMap', async function (req, res) {

        let tableMap = getJson('tableMap');
        res.json({code: 1, data: tableMap})
    })
    app.get(mainUrl + 'getTableNameMap', async function (req, res) {

        let tableMap = getJson('tableMap');
        let s = {}
        Object.keys(tableMap).forEach(o => {
            s[tableMap[o].tableName] = o;
        })


        res.json({code: 1, data: s})
    })
    app.get(mainUrl + 'getMenu', async function (req, res) {
        let sm = req.query;
        let result = await queryTable('menu', sm)
        res.json({code: 1, data: result})
    })
    app.post(mainUrl + 'setTableMap', async function (req, res) {

        let tableMap = req.body;
        setJson('tableMap', tableMap)
        res.json({code: 1})
    })
    app.post(mainUrl + 'log', async function (req, res) {
        let model = req.body;
        model.logTime = new Date();
        create('log', model)
        res.json({code: 1})
    })

    app.get(mainUrl + 'getConfig', async function (req, res) {
        let config = await queryOne('system_config', {isActive: true})
        res.json({code: 0, data: config})
    });


    initMongoDb();

}


//初始化mongoose
function initMongoDb() {

    let schema = getJson('schema');
    Object.keys(schema).forEach(tableName => {
        if (mongoose.models[tableName]) {
            return
        }
        let table = schema[tableName];
        let temp_schema = {};


        Object.keys(table).forEach(colName => {
            let col = table[colName]
            if (col.substr) {
                col = eval(col)
            } else {
                col.type = col.type || 'String';
                col.type = eval(col.type);
            }

            temp_schema[colName] = col;
        });


        temp_schema.inputDate = {type: Date};
        temp_schema.inputDater = {type: String};

        tables[tableName] = mongoose.model(tableName, new mongoose.Schema(
            temp_schema,
            {versionKey: false}
        ), tableName);
    })
}


function setJson(table, data) {
    var str_json = JSON.stringify(data);
    fs.writeFileSync(__dirname + '/data/' + table + '.json', str_json, 'utf8')
}

function getJson(table) {

    let path = __dirname + '/data/' + table + '.json'
    let result = JSON.parse(fs.readFileSync(path));
    return result
}

async function deleteTable(table, where) {
    let entity = tables[table];
    return entity.deleteMany(where)
}


async function queryTable(table, sm, field, page, pageSize) {
    let entity = tables[table];


    if (!entity) {
        return []
    } else {
        let query = entity.find(sm, field);

        Object.keys(entity.schema.obj).forEach(key => {

            if (entity.schema.obj[key].ref) {
                query.populate(key)
            }
            if (entity.schema.obj[key].push) {
                if (entity.schema.obj[key][0].ref) {
                    query.populate(key)
                }
            }
        })

        if (page != undefined && pageSize != undefined) {

            let count = await entity.countDocuments(sm);
            query.skip((page - 1) * pageSize)
                .limit(pageSize);

            let r = await query;
            return {count, list: r}
        }


        let r = await query;

        if (r.length <= 0) {
            if (table === 'strategy_economy' && sm.benchmarkOd) {
                return r
            }
        }
        return r


    }

}

async function queryOne(table, sm) {
    let r = await queryTable(table, sm, {})
    return r[0]

}

async function logEmptyField(name, value, params) {
    try {
        await create('empty_field_log', {
            _id: [name, value].join('_'),
            name,
            value,
            status: 0,
            createAt: new Date(),
            params
        })

    } catch (e) {

    }
}

async function saveSingle(table, ob) {
    Object.keys(ob).forEach(o => {
        if (o.indexOf('$') !== -1) {
            delete ob[o]
        }
    })


    if (ob._id) {
        ob = await processSingleData(ob, table)
        return await update(table, ob)
    } else {
        ob = await processSingleData(ob, table)
        return await create(table, ob)
    }

}

async function deleteSingle(table, _id) {

    if (ob._id) {
        return await update(table, ob)
    } else {
        return await create(table, ob)
    }

}

async function create(table, ob) {
    let entity = tables[table];


    return await entity.create(ob)
}

async function update(table, ob) {
    let entity = tables[table];

    return await entity.update({_id: ob._id}, ob)
}

//预处理字段
function processCol(schema, tableSchema) {
    Object.keys(schema).forEach(tableName => {

        let table = schema[tableName];

        if (tableSchema && tableSchema.tableName === tableName) {
            //添加_id字段，否则就变成Object类型了
            if (tableSchema.idRules.length > 0) {
                table._id = {type: 'String'}
            }
        }
    })
}

async function processSingleData(data, tableName) {
    let datas = [data]
    await processData(datas, tableName)
    return datas[0];
}

//预处理一些字段，比如区域选择，范围选择
async function processData(datas, tableName) {


    let schema = getJson('schema')
    let tableSchema = schema[tableName]


    for (let data of datas) {

        if (data._id === undefined) {
            if (tableSchema.idRules && tableSchema.idRules.length > 0) {
                let _id = tableSchema.idRules.map(f => {
                    return data[f]
                }).join('_')
                data._id = _id;
            }
        }



        if (zeroFilterField[tableName]) {
            zeroFilterField[tableName].forEach(field => {
                data[field] = data[field] == 0 ? '' : data[field];
            })
        }




    }


    return datas;

}


async function queryArea(tableName, otherParams) {
    let sm = Object.assign({}, otherParams);
    sm.depArea_array = otherParams.depArea;
    sm.arrArea_array = otherParams.arrArea;
    sm.depArea_array_notin = {
        $nin: [otherParams.depArea]
    };
    sm.arrArea_array_notin = {
        $nin: [otherParams.arrArea]
    };
    delete sm.depArea;
    delete sm.arrArea;
    let r = await queryOne(tableName, sm)

    return r
}

async function queryAreaList(tableName, otherParams) {
    let sm = Object.assign({}, otherParams);
    sm.depArea_array = otherParams.depArea;
    sm.arrArea_array = otherParams.arrArea;
    sm.depArea_array_notin = {
        $nin: [otherParams.depArea]
    };
    sm.arrArea_array_notin = {
        $nin: [otherParams.arrArea]
    };
    delete sm.depArea;
    delete sm.arrArea;
    let r = await queryTable(tableName, sm)
    if (!r) {
        console.log(tableName)
        console.log(JSON.stringify(sm))
    }
    return r
}

//同步用户区域
async function syncUserRegionOdConfig() {

    let list = await queryTable('strategy_business');
    let list2 = await queryTable('strategy_economy');
    list = list.concat(list2);
    list = list.map(o => o._doc)
    let userRegionOdConfig = list.map(o => {
        return o.od + ':' + o.analyst;
    }).distinct().map(o => {
        let value = o.split(':')
        return {
            od: value[0],
            analyst: value[1]
        }
    })
    let entity = tables['userRegionOdConfig'];
    for (let o of userRegionOdConfig) {
        let userRegionOdConfigOb = await queryOne('userRegionOdConfig', {od: o.od, analyst: o.analyst})
        if (userRegionOdConfigOb) {
            o.setter = userRegionOdConfigOb.setter;
        }
        return await entity.update({od: o.od, analyst: o.analyst}, o, {upsert: true})
    }


    await update('userRegionOdConfig', userRegionOdConfig)
}


function getTable(table) {
    let entity = tables[table];
    return entity
}




module.exports = {
    getTable,
    queryTable,
    queryOne,
    apiInit,
    deleteTable,
    getRuleResult,
    queryArea,
    queryAreaList,
    ruleSelection,
    saveSingle,
    logEmptyField,
    create,
    getJson,
}

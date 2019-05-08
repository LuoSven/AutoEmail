function commonService($http) {

    //获取菜单
    async function getMenus() {

        let menus=[
            {
                "order" : 1,
                "menus" : [
                    {
                        "name" : "发送邮件",
                        "url" : "basic.sendEmail"
                    },
                    // {
                    //     "name" : "地址管理",
                    //     "url" : "basic.areaCode"
                    // },

                ],
                "name" : "邮件管理",
                "abstract" : true,
                "url" : "basic",
                "icon" : "fa-book",
                "category" : "BASIC"
            }
        ]

        menus.sort((a, b) => {
            return a.order - b.order;
        })
        return menus;
    }


    function confirm(message, func, noFunc) {
        swal({
                title: '',
                text: message,
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
                isConfirm ? func() : (noFunc && noFunc());
            });
    }

    function uploadTables(table) {
        return $http.post("/api/db/common/uploadTable", table);
    }

    function getTableMap() {
        return $http.get("/api/db/common/getTableMap");
    }

    function getConfig() {

        return $http.get("/api/db/common/getConfig");
    }


    function getLocalConfig() {
        let system_config;
        try {
            system_config = JSON.parse(localStorage.getItem('system_config'))
        } catch (e) {

        }
        return system_config;
    }

    function setLocalConfig(config) {
        return localStorage.setItem('system_config', JSON.stringify(config))
    }

    function setTableMap(tableMap) {
        return $http.post("/api/db/common/setTableMap", tableMap);
    }

    function getTableNameMap() {

        return $http.get("/api/db/common/getTableNameMap");

    }

    function syncUserRegionOdConfig() {

        return $http.get("/api/db/common/syncUserRegionOdConfig");

    }

    async function getAllMenus() {
        let menuList = []
        let menus = await getMenus()
        menus.forEach(m => {
            m.menus.forEach(menu => {
                menu.parent = m;

                menuList.push(menu)

            })
        })
        return menuList
    }

    async function getAllMenusMap() {
        let menus = await getAllMenus();
        let menuMap = {}
        menus.forEach(menu => {
            menuMap[menu.url] = menu;
        })
        return menuMap;
    }

    async function getDictNameMap() {

        let r = await $http.get("/api/db/baisc/getDict");

        let nameMap = {}
        r.data.data.forEach(o => {
            nameMap[o.type] = nameMap[o.type] || {}
            if (o.category) {
                nameMap[o.type][o.category] = nameMap[o.type][o.category] || {}
                nameMap[o.type][o.category][o.value] = o.name;
            }else{
                nameMap[o.type][o.value] = o.name;
            }
        })
        return nameMap
    }


    return {
        getDictNameMap,
        syncUserRegionOdConfig,
        uploadTables,
        getMenus,
        getAllMenus,
        getAllMenusMap,
        confirm,
        getTableMap,
        setTableMap,
        getTableNameMap,
        getConfig,
        getLocalConfig,
        setLocalConfig
    }
}

angular
    .module('piApp')
    .factory('commonService', commonService);


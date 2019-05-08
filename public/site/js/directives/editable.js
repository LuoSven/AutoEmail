function editableTable($window) {
    return {
        restrict: 'A',
        // scope: {
        //     menuConfig: '=',
        //},
        compile: function (element, attrs) {

            let $element = $(element);
            let repeat = $element.find('*[editable-repeat]').attr('ng-repeat')
            if (!repeat) {
                repeat = $element.find('*[ng-repeat]').attr('ng-repeat')
            }

            let itemName = (repeat.split('in')[0]).trim();
            let listName = (repeat.split('in')[1]).trim();
            let parentName = listName.split('.')[0]
            let eventName = itemName.toUpperCase() + new Date().format('ddhhmmssS')


            let cancelEventName = `cancel${eventName}`
            let editEventName = `edit${eventName}`
            let addEventName = `add${eventName}`
            let saveEventName = `save${eventName}`
            let deleteEventName = `delete${eventName}`
            let copyEventName = `copy${eventName}`
            let itemListName = `_${eventName}_list`
            let radioName = attrs['editableRadioName'] || 'radio_' + Math.random();
            let addTemplateName = attrs['editableTemplate'];
            let saveFunction = attrs['editableSave'];
            let deleteFunction = attrs['editableDelete'];
            //说明这个表明细是否是需要保存的
            let saveable = attrs['editableSaveable'] === "true";
            //列表型对象的记录
            let listFieldList = []

            $element.find("*[editable-field]").each(function () {
                let html = initItem(this)
                $(this).html(html)
            })


            let $btnFiled = $(element).find("*[editable-btn]")
            $btnFiled.html(`  <div ng-if="!${itemName}.isEditing">
                                                            <i btn-right="update" class="fa fa-fw fa-edit text-success"
                                                               ng-click="${editEventName}(${itemName})"></i>
                                                                  <i btn-right="insert" class="fa fa-fw fa-copy text-info" 
                                                               ng-click="${copyEventName}(${listName},${itemName},$index)"></i>
                                                                <i btn-right="delete" class="fa fa-fw fa-trash-o text-danger" 
                                                               ng-click="${deleteEventName}(${listName},${itemName},$index)"></i>
                                                             
                                                        </div>
                                                        <div  ng-if="${itemName}.isEditing">
                                                            <i class="fa fa-fw fa-save text-success"
                                                               ng-click="${saveEventName}(${listName},${itemName},$index)"></i>
                                                            <i class="fa fa-fw fa-times text-danger"
                                                               ng-click="${cancelEventName}(${listName},${itemName},$index)"></i>
                                                        </div>`)

            let $addFiled = $(element).find("*[editable-add]")
            $addFiled.html(` <i btn-right="insert" class="fa fa-fw fa-plus-square-o text-warning " ng-click="${addEventName}(${listName},${parentName})"></i>`)


            function initItem(target) {
                let $target = $(target);
                let prop = $target.attr('editable-field');
                let type = $target.attr('editable-type');
                let size = $target.attr('editable-size');
                let unit = $target.attr('editable-unit') || "";
                let rangeSpan = $target.attr('editable-range')
                let options = $target.attr('editable-option')
                let isList = $target.attr('editable-list') === "true"
                type = type || 'text';
                size = size || 'full';

                if (rangeSpan !== undefined) {

                    let beginProp = $target.attr('editable-field-begin');
                    let endProp = $target.attr('editable-field-end');
                    let html = `${getHtml(itemName, beginProp, size)}${rangeSpan}${getHtml(itemName, endProp, size)}${unit} `
                    return html;

                }
                if (isList) {

                    let split = $target.attr('editable-list-split') || '/';
                    listFieldList.push({prop, split})
                    let html = getListHtml(itemName, prop, size, split)
                    return html;
                }

                let html = getHtml(itemName, prop, size)
                return html + unit;

                function getHtml(parent, prop, size) {
                    let cssClass = `line-input-${size}`
                    let html;

                    switch (type) {


                        case"text":
                            html = `
                        <span ng-if="!${parent}.isEditing">{{${parent}.${prop}}}</span>
                        <input ng-if="${parent}.isEditing"
                        class="line-input ${cssClass}"
                        ng-model="${parent}.temp.${prop}">`
                            break

                        case"select":
                            html = `
                        <span ng-if="!${parent}.isEditing">{{${parent}.${prop}}}</span>
                       <select  ng-if="${parent}.isEditing" class="line-select line-input ${cssClass}"  ng-model="${parent}.temp.${prop}" ng-options="t as t for t in ${options}"></select>   
                        `
                            break
                        case"date":
                            html = `
                        <span ng-if="!${parent}.isEditing">{{${parent}.${prop}}}</span>
                        <input    ng-if="${parent}.isEditing" lay-date="{format:'yyyy-MM-dd HH:mm:ss'}" id="${parent}_${parseInt(Math.random() * 100000)}"
                        class="line-input ${cssClass}"
                        ng-model="${parent}.temp.${prop}">`

                            break

                        case"datetime":
                            html = `
                        <span ng-if="!${parent}.isEditing">{{${parent}.${prop}}}</span>
                        <input    ng-if="${parent}.isEditing" lay-date="{format:'yyyy-MM-dd HH:mm:ss','type':'datetime'}" id="${parent}_${parseInt(Math.random() * 100000)}"
                        class="line-input ${cssClass}"
                        ng-model="${parent}.temp.${prop}">`

                            break
                        case"time":
                            html = `<span ng-if="!${parent}.isEditing">{{${parent}.${prop}}}</span>
                        <input    ng-if="${parent}.isEditing" lay-date="{format:'HH:mm:ss','type':'time'}" id="${parent}_${parseInt(Math.random() * 100000)}"
                        class="line-input ${cssClass}"
                        ng-model="${parent}.temp.${prop}">`

                            break

                        case"check":
                            html = `
                        <span ng-if="!${parent}.isEditing">{{${parent}.${prop}?'是':'否'}}</span>
                        <input type="checkbox" ng-if="${parent}.isEditing"
                        class="line-input ${cssClass}"
                        ng-model="${parent}.temp.${prop}">`
                            break
                        case"radio":
                            html = `
                        <span ng-if="!${parent}.isEditing">{{${parent}.${prop}?'是':'否'}}</span>
                        <input type="radio" ng-if="${parent}.isEditing" name="${radioName}"
                        class="line-input ${cssClass}"
                        ng-model="${parent}.temp.${prop}">`
                            break


                        default:
                            html = `
                        <span ng-if="!${parent}.isEditing">{{${parent}.${prop}}}</span>
                        <input ng-if="${parent}.isEditing"
                        class="line-input ${cssClass}"
                        type="${type}"
                        ng-model="${parent}.temp.${prop}">`
                    }
                    html = `<div style="display: inline-block">${html}</div>`
                    return html;
                }

                function getListHtml(parent, prop, size, split) {
                    let cssClass = `line-input-${size}`
                    let html = `
                       <span ng-if="!${parent}.isEditing">{{${parent}.${prop}}}</span>
                   `;

                    switch (type) {

                        case"select":
                            html += `
                         <div   ng-if="${parent}.isEditing" >
                        <div class="dI" ng-repeat="z in ${parent}.temp.${prop}${itemListName} track by $index">
                        <select class="line-select line-input ${cssClass}" ng-model="z.value" ng-options="t as t for t in ${options}"></select> 
                        <i ng-click="${parent}.temp.${prop}${itemListName}.removeAt($index)" class="fa fa-times text-warning "></i>&nbsp;${split} 
                        </div> 
                         <i ng-click="${parent}.temp.${prop}${itemListName}.push({value:''})" class="fa fa-plus fa-fw text-info"></i>
                        </div>
                          
                     `
                            break
                        default:
                        case"text":
                            html += `
                         <div   ng-if="${parent}.isEditing" >
                        <div class="dI" ng-repeat="z in ${parent}.temp.${prop}${itemListName} track by $index">
                         <input  
                        class="line-input ${cssClass}"
                        ng-model="z.value"> 
                        <i ng-click="${parent}.temp.${prop}${itemListName}.removeAt($index)" class="fa fa-times text-warning "></i>&nbsp;${split}
                       
                        </div> 
                         <i ng-click="${parent}.temp.${prop}${itemListName}.push({value:''})" class="fa fa-plus fa-fw text-info"></i>
                        </div>
                          
                     `
                            break

                    }
                    html = `<div style="display: inline-block">${html}</div>`
                    return html;
                }

            }


            return function ($scope, element, attrs) {
                function stringToList(value, split) {
                    let tempList = (value || "").split(split).map(o => {
                        return {
                            value: o
                        }
                    })
                    return tempList
                }

                function listToString(tempList, split) {
                    return tempList.map(s => s.value).distinct().join(split)
                }

                $scope[editEventName] = function (ob) {
                    ob.temp = angular.copy(ob);
                    listFieldList.forEach(o => {
                        ob.temp[o.prop + itemListName] = stringToList(ob.temp[o.prop], o.split)
                    })
                    ob.isEditing = true;
                }
                $scope[cancelEventName] = function (list, ob, index) {
                    if (!(ob.id || ob._id) && saveable) {
                        list.removeAt(index)
                        return;
                    }
                    ob.isEditing = false;
                }
                $scope[copyEventName] = function (list, ob, index) {
                    let model = angular.copy(ob);
                    model.id = null;
                    model._id = null;
                    if ($scope[addTemplateName]) {
                        model = angular.copy($scope[addTemplateName])
                    }
                    model.isEditing = true;
                    model.temp = angular.copy(ob);
                    listFieldList.forEach(o => {
                        model.temp[o.prop + itemListName] = stringToList(model.temp[o.prop], o.split)
                    })

                    list.insertAt(index + 1, model)
                }
                $scope[addEventName] = function (list, parent) {

                    let model = {}
                    if ($scope[addTemplateName]) {
                        model = angular.copy($scope[addTemplateName])
                    }
                    model.isEditing = true;
                    model.temp = {$parent: angular.copy(parent)}
                    listFieldList.forEach(o => {
                        model.temp[o.prop + itemListName] = [];
                    })

                    list.insertAt(0, model)
                }
                $scope[saveEventName] = function (list, ob, index) {

                    listFieldList.forEach(o => {
                        ob.temp[o.prop] = listToString(ob.temp[o.prop + itemListName], o.split);
                    })

                    if (!saveFunction) {
                        afterSave(list, ob, index)
                        return
                    }


                    if (isAsync($scope[saveFunction])) {
                        $scope[saveFunction](ob.temp).then(function (r) {
                            afterSave(list, ob, index, r)
                        })
                    } else {
                        let r = $scope[saveFunction](ob.temp);
                        afterSave(list, ob, index, r)
                    }

                }
                $scope[deleteEventName] = function (list, ob, index) {
                    if (!deleteFunction) {
                        afterDelete(list, ob, index)
                        return
                    }
                    if (isAsync($scope[deleteFunction](ob))) {
                        $scope[deleteFunction](ob).then(r => {
                            afterDelete(list, ob, index)
                        })
                    } else {
                        afterDelete(list, ob, index)
                    }

                }

                function afterSave(list, ob, index, r) {
                    ob = angular.copy(ob.temp);
                    if (!ob._id && r) {
                        ob._id = r.data.data;
                    }
                    ob.isEditing = false;
                    list[index] = ob;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }

                function afterDelete(list, ob, index) {
                    list.removeAt(index)
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }

                function isAsync(fn) {
                    return fn.constructor.name === 'AsyncFunction';
                }

            }

        }
    };
}

function selectAble($window) {
    return {
        restrict: 'A',
        compile: function (element, attrs) {

            let $element = $(element);
            var model = attrs.ngModel
            $element.removeAttr('ng-model')
            var change = attrs.ngChange;
            $element.removeAttr('ng-change')
            let listName = attrs.selectAble;
            $element.addClass('line-select-content')
            let html = ` 
                        <select ng-model="${model}"  ${change ? 'ng-change="' + change + '"' : ''} class="line-select" ng-options="item.code as item.name for item in ${listName} "></select>
                      `

            $element.html(html)
            return function ($scope, element, attrs) {
            }

        }

        ,
    };
}

angular
    .module('piApp')
    .directive('editableTable', editableTable)
    .directive('selectAble', selectAble);

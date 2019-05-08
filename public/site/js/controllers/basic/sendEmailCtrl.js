function sendEmailCtrl($scope, $rootScope, $uibModal, $timeout, basicService) {
    let container = $('.ibox-content')


    $scope.model = {
        senderConfig: {
            userAccount: '253484323@qq.com',
            password: 'bzkhhamcrnwebgde',
            host: 'smtp.qq.com',
            port: 465,
            ssl: true,
        },
        title: '',
        html: '',
        toEmails: [],
        files: []
    }
    init()

    $scope.sendEmail = function () {
        let formData = new FormData();
        for (let i = 0; i <= $scope.model.files.length; i++) {
            let o = $scope.model.files[i]
            formData.append("file" + i, o);
        }

        formData.append("title", $scope.model.title);
        formData.append("html", $scope.model.html);
        formData.append("toEmails", JSON.stringify($scope.model.toEmails));

        basicService.sendEmail(formData)

    }

    function init() {
        $scope.emails = [
            {name: '张三', email: 'mirkmf110@163.com'},
            {name: '李四', email: 'mirkmf110@163.com'}
        ]

        async function handleFile(e) {
            let files = e.target.files;
            $scope.model.files = files;


        }

        $('#fileUpload').bind('change', handleFile);
    }


}


angular
    .module('piApp')
    .controller('sendEmailCtrl', sendEmailCtrl)
;

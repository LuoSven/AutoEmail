/**
 * INSPINIA - Responsive Admin Theme
 *
 */
function config($translateProvider) {

    $translateProvider
        .translations('cn', {

            // Define all menu elements
            TITLE: '标题',
            CONFIRM: '确定',
            CANCEL: '取消',
            SEARCH: '搜索',
            LOGOUT: '登出',
            UPDATEPASSWORD: '修改密码',
            LANGUAGE: '语言',
            USERNAME: '用户名',
            PASSWORD: '密码',
            ELOADSYSTEM: '机尾号分配系统',
            LOGIN: '登录',
            REMEMBERME: '记住密码',
			flightCoverage: '航班覆盖率',
			numFlights: '航班数',
			numStaff: '员工人数',
			staffUtility: '总体用工率（执行任务时间/上班时间）',
			utilityByStaffType: '分组用工率',
			groupType: '员工分组',
			lisence: '驾照',
			utility: '用工率',
			flightId: '序号',
			depTime: '起飞时间',
			fleetType: '机型',
			flightNum: '航班号',
			gate: '机位',
			gateArea: '机位区域',
			intDomType: '国际/国内分组',
			fromGate: '出发区域',
			toGate: '目标区域',
			travelTime: '行驶时间',
			staffId: '序号',
			name: '姓名',
			shiftType: '班次（早、晚）',
			subGroupType: '分组',
			driveLicense: '是否有驾照',
			maxNumFlightServeEachStaff: '每个员工服务的最大航班数',
			maxNumFlightsServedPerTraval: '连续服务的最大航班数', 
			maxTurnTimeBetweenTwoShifts: '回到基地和执行任务间最大间隔时间（分钟）', 
			maxTurnTimeBetweenTwoTasks: '两个航班服务间最大间隔时间（分钟）', 
			minNumFlightServeEachStaff: '每个员工服务的最小航班数', 
			serveTimeForDomestic: '国内航班服务时长（分钟）', 
			serveTimeForInternational: '国际航班服务时长（分钟）', 
			travelTimeFromHubToGate: '基地和机位间的行驶时间（分钟）',
            distanceMultiplier: "步行和开车的速度倍数",
            isMealTimeContraintsOn: "用餐时间限制是否打开",
            isMealTimeConstraintHard: "用餐时间是否硬性限制",
            mealTimePenalty: "用餐时间限制的罚分",
            similarDepTimeThredhold: "一人多机航班起飞时刻间隔时间",
            mealTime: "用餐时间段设置",

            boardingTimeThreshold: "开始登机时间",
            loadingTimeThreshold: "开始装载行李时间",
            boardingLength: "登机时长",
            loadingLengthDom: "窄体机上行李时长",
            loadingLengthInt: "宽体机上行李时长",
			
			isCovered: '是否覆盖',
            type: '类型',
            remark: '备注',
            startTime: '开始时间',
            endTime: '结束时间',
        })
        .translations('en', {

            // Define all menu elements
            TITLE: 'Title',
            CONFIRM: 'Confirm',
            CANCEL: 'Cancel',
            SEARCH: 'Search',
            LOGOUT: 'Log out',
            LANGUAGE: 'Language',
            USERNAME: 'User Name',
            PASSWORD: 'Password',
            ELOADSYSTEM: 'Tail Assignment System',
            LOGIN: 'Login',
            REMEMBERME: 'Remember me',
        });

    $translateProvider.preferredLanguage('cn');

}

angular
    .module('piApp')
    .config(config)

angular.element(window).bind('load', function() {
	$("#logoutBtn").click(function(e){
		e.preventDefault();
		
		swal({
			title: "",
			text: "确定退出系统吗？",
			type: "warning", 
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			closeOnConfirm: false,
			showLoaderOnConfirm: true,
			closeOnCancel: true 
		}, function(isConfirm){
			if (isConfirm) {
				window.location = getRootPath() + "/index.html";
			} 
		});
		
		return false;
	});
})
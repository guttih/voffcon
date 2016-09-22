function initControl(){
	$('#btnUserAccessControl').click(function() {
		var control    = $( '#item' ).data('control');
		if (control !== undefined && control.id !== undefined){
			window.location.href = '/controls/useraccess/'+ control.id;
		}
	});
}
$(function () {  
	initAce();
	initControl();
});
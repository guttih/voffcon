function initControl(){
	if (typeof itemUpload !== 'undefined' && itemUpload !== 'undefined') {

			if (itemUpload.name !== undefined){
				$("#name").val( itemUpload.name );
			}
			
			if (itemUpload.description !== undefined){
				$("#description").val( itemUpload.description );
			}
			if (itemUpload.helpurl !== undefined){
				$("#helpurl").val( itemUpload.helpurl );
				$("#a-open-helpurl").attr({href: itemUpload.helpurl});
			}
			if (itemUpload.template !== undefined){
				editHtmlCtrl.setValue(itemUpload.template, -1);
			}
			if (itemUpload.code !== undefined){
				editJsCtrl.setValue(itemUpload.code, -1);
			}

			
			document.getElementById("control-form").action = "/controls/register";


	}
	
	$('#btnUserAccessControl').click(function() {
		var control    = $( '#item' ).data('control');
		if (control !== undefined && control.id !== undefined){
			window.location.href = '/controls/useraccess/'+ control.id;
		}
	});
	$('#btnExportControl').click(function() {
		var control    = $( '#item' ).data('control');
		if (control !== undefined && control.id !== undefined){
			window.location.href = '/controls/export/'+ control.id;
		}
	});
}
$(function () {  
	initAce();
	initControl();
});
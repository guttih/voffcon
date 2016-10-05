

function initCard(){
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

			if (itemUpload.code !== undefined){
				editJsCard.setValue(itemUpload.code, -1);
			}

			document.getElementById("card-form").action = "/cards/register";
	}
	$('#btnUserAccessCard').click(function() {
		var card    = $( '#item' ).data('card');
		if (card !== undefined && card.id !== undefined){
			window.location.href = '/cards/useraccess/'+ card.id;
		}
	});
	$('#btnExportCard').click(function() {
		var card    = $( '#item' ).data('card');
		if (card !== undefined && card.id !== undefined){
			window.location.href = '/cards/export/'+ card.id;
		}
	});
}

$(function () {  
	initAce();
	initCard();
});
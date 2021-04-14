//recupere la lang envoyé par le php
var lang = $('html').attr('lang')


//initialise les popovers
$(document).ready(function(){
	$('[data-toggle="popover"]').popover({
		html: true
	}); 
});
	

//fonction pour update les popover
function changePopover(skillObject, message){
	skillObject.attr('data-bs-content',message)
	skillObject.popover('show')
}

//fonction pour update les filtres gris
function greyscale(element, active){
	if(!active){
		element.css('filter', 'grayscale(1)');
		element.css('-webkit-filter:', 'grayscale(1)');
	}else{
		element.css('filter', '');
		element.css('-webkit-filter:', '');
	}
}
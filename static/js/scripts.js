$( ".vital" ).click(function() {
    $(this).children('.vital-overlay-wrapper').fadeIn(500);
});

$( ".close-overlay" ).click(function() {
	$(this).parent().parent().fadeOut(300);
	event.stopPropagation();
});

//$.ajax({
//  url: "test.html",
//  cache: false
//})
//  .done(function( html ) {
//    $( "#results" ).append( html );
//  });
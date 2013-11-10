//GLOBAL
// Variables used across this file
var currentContentID = '#home';

// NAVIGATION
// Handles menu item clicks and page navigation
$( 'ul.navigation li a').click(function() {
	// Only do stuff if the button clicked isn't already active
	if (!$(this).hasClass('active-link')) {
		// Set the previously-active button to inactive
		$(this).parent().parent().children().each(function() {
			$(this).children().removeClass('active-link');
			var className = $(this).children().attr('class');
			var activeSuffix = '-active';
			if (className.length > activeSuffix.length) {
				var suffixStartPos = className.length - activeSuffix.length;
				if (className.substring(suffixStartPos, className.length) == activeSuffix) {
					// Currently selected menu item
					var inactiveClassName = className.substring(0, suffixStartPos);
					$(this).children().removeClass();
					$(this).children().addClass(inactiveClassName);
					currentContentID = '#' + inactiveClassName.substring(4, inactiveClassName.length);
				}
			}
		});
		// Set the clicked button to active
		var buttonName = $(this).attr('class');
		$(this).removeClass(buttonName);
		var activeButtonName = buttonName + '-active';
		$(this).addClass(activeButtonName);
		$(this).addClass('active-link');
		// Show the new content
		newContentID = '#' + buttonName.substring(4, buttonName.length);
		$( currentContentID ).fadeOut(500);
		$( newContentID ).fadeIn(500);
	}
});

// VITALS
// Handle vital selections and the vital overlay
$( ".vital" ).click(function() {
    $(this).children('.vital-overlay').fadeIn(500);
});

$( ".close-overlay" ).click(function() {
	$(this).parent().fadeOut(300);
	event.stopPropagation();
});

//$.ajax({
//  url: "test.html",
//  cache: false
//})
//  .done(function( html ) {
//    $( "#results" ).append( html );
//  });
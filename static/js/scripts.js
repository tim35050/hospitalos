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
// Load some D3 stuff at the way beginning
$( document ).ready(function() {
	loadD3Vitals();
});

// Handle vital selections and the vital overlay
$( ".vital" ).click(function() {
	var vo = $(this).children('.vital-overlay');
    vo.fadeIn(500, function() {
    	voc = vo.children('.vital-overlay-content');
    	classes = voc.children('.vital-stats').attr('class');
    	vital = classes.split(' ')[1]
    	animateVital(vital);
    });
});

$( ".close-overlay" ).click(function() {
	$(this).parent().fadeOut(300);
	event.stopPropagation();
});

function animateVital(vital) {
	img = d3.select('.' + vital + ' image');
	console.log(img);
	img.transition()
		.attr("x", 100);
}

function loadD3Vitals() {

	var vitals = getVitalRanges();

	for (i = 0; i < vitals.length; i++) {
		vital = vitals[i];

		for (j = 0; j < vital.dataset.length; j++) {
			dataset = vital.dataset[j];

			var w = 500;
			var h = 80;
			var barSpacing = 2;
			var barHeight = 14;
			var barYPos = 42;
			var padding = 25;
			var cumLength = 0;

			// for (k=0; k < dataset.value.length; k++) {
			// 	w += dataset.value[k][0] + barSpacing;
			// }

			var svg = d3.select('.' + vital.id)
						.append("svg")
						.attr("width", w)
						.attr("height", h);

			var xScalePos = d3.scale.linear()
									.domain([dataset.min, dataset.max])
									.range([padding, w - padding]);

			var xScaleVal = d3.scale.linear()
									.domain([0, dataset.max - dataset.min])
									.range([padding, w - padding]);

			svg.selectAll("rect")
				.data(dataset.value)
				.enter()
				.append("rect")
				.attr("x", function(d) {
					xVal = xScaleVal(cumLength);
					cumLength += d[0];
					return xVal;
				})
				.attr("y", barYPos)
				.attr("width", function(d) {
					return xScaleVal(cumLength) - xScaleVal(cumLength - d[0]) - barSpacing;
				})
				.attr("height", barHeight)
				.attr("fill", function(d) {
					return d[1]
				});

			svg.append("text")
				.attr("class", "vital-stats-label")
				.attr("x", padding)
				.attr("y", barYPos - 4)
			    .text(dataset.name);

			var imageWidth = 33;
			var imageHeight = 36
			svg.append("image")
				.attr("x", padding - imageWidth/2)
				.attr("y", barYPos - imageHeight)
				.attr("xlink:href", "../static/css/images/smiley-neutral.png")
				.attr("src", "../static/css/images/smiley-neutral.png")
				.attr("width", imageWidth)
				.attr("height", imageHeight);

			var xAxis = d3.svg.axis()
								.scale(xScalePos)
								.tickValues(xScalePos.domain())
								.orient("bottom");
			svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(0," + (h - padding) + ")")
					.call(xAxis);
		}
	}
}

function getVitalRanges() {
	vr = [
			{ 	
				id: 'bloodpressure',
				dataset:
					[
						{
							name: 'systolic',
							min: 40,
							max: 180,
							value: 
								[
									[50, "#F4A731"], [30, "#78BB66"], 
									[20, "#F4A731"], [40, "#ED5A69"]
								]
						},
						{
							name: 'diastolic',
							min: 40,
							max: 120,
							value:
								[
									[20, "#F4A731"], [20, "#78BB66"], 
									[10, "#F4A731"], [30, "#ED5A69"]
								]
						}
					]
			},
			{
				id: 'bloodglucose',
				dataset:
					[
						{
							name: '',
							min: 20,
							max: 280,
							value: 
								[
									[50, "#F4A731"], [80, "#78BB66"], 
									[30, "#F4A731"], [100, "#ED5A69"]
								]
						}
					]
					
			},
			{
				id: 'bmi',
				dataset:
					[
						{
							name: '',
							min: 10,
							max: 40,
							value: 
								[
									[8.5, "#F4A731"], [6.5, "#78BB66"], 
									[5, "#F4A731"], [10, "#ED5A69"]
								]
						}
					]
			}
		];
	return vr;
}

//$.ajax({
//  url: "test.html",
//  cache: false
//})
//  .done(function( html ) {
//    $( "#results" ).append( html );
//  });
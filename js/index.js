/*	Margin, Width and height */
var margin = {top: 20, right: 40, bottom: 70, left: 58};
var width = 940  - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;
/*	Global variable to control the length of D3 transitons */
var duration = 400;
/*	Global variable to hold the cc or ac choice */
var count = "cc"
/*	Global variable to hold the cc or ac choice */
var field = "all"
/*	Global variable to control which year to disylay */
var displayYear = 2012;
/*	Global Array to hold all the data we currently want to display */
var displayArray = [];
/*	Global variables to control field and count text in axis label */
var displayCount = "Corrected count";
var displayField = "All fields";
/*	Colours for the bars */
var allBars = "#A0BEC5";
/*	A var to determine if the scale should be adjustedq */
var adjustScaleCheck = false;
			
/*	Create SVG element */
var svg = d3.select(".count-chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)

/* Create JqueryUI buttons */
$(function() {
	$( "#check" ).button();
	$( ".count-select" ).buttonset();
	$( ".select-field" ).buttonset();
});

/*	Load in JSON data then call draw() */
d3.json('data/ranking-country-global.json', draw);

/*	The draw function is called only once the JSON file has fully loaded 
	and is responsible for building the barchart */
function draw(data) {

	/* store this number to use to create a staggered transition */
	var numberOfBars = data.year2008.length;

	/*	Set up bars - one for each country in the chosen year */
	svg.selectAll("rect")
				.data(data.year2012, function(d, i) {
					return d.country;
				})
				.enter()
				.append("rect")
				.attr("width", 0)
				.attr("x", 0)
				.attr("height", 0)
				.attr("y", 0);	

	/* Two jqueryUI functions to build the year and field sliders */
	function makeYearSlider () {
		var select = $( ".select-year" );
		var slider = $( "<div id='slider'></div>" ).insertAfter( select ).slider({
			min: 1,
			max: 5,
			range: "min",
			value: select[ 0 ].selectedIndex + 1,
			slide: function( event, ui ) {
				select[ 0 ].selectedIndex = ui.value - 1;
				switch(ui.value) {
					case 5:
						displayYear = "2012";
						break;
					case 4:
						displayYear = "2011";
						break;
					case 3:
						displayYear = "2010";
						break;
					case 2:
						displayYear = "2009";
						break;
					case 1:
						displayYear = "2008";
						break;
					default:
						displayYear = "2012";
						break;																	
				};
				// updateYear();
				updateDisplayArray()
			}
		});
		$( ".select-year" ).change(function() {
			slider.slider( "value", this.selectedIndex + 1 );
		});
	};

	/* Create checkboxes for each country inside the country-select form */
	d3.selectAll(".country-select")
		.selectAll("label")
		.data(data.year2012)
		.enter()
		.append("label")
		.html(function (d) {
			return "<input type='checkbox' value='" + d.country + "' checked>" + d.country;
		});

	d3.selectAll(".country-select input").on("change", update);		

	function update() {
		console.log(this.value);

		console.log(displayArray.length);

		displayArray.shift();

		console.log(displayArray.length);

		/* Redefine the X Ordinal Scale */
		xScale.domain(displayArray.map(function(d) { return d.country; }))
			.rangeRoundBands([margin.left,(width + margin.right)], 0.1);	

		//Draw X axis
		svg.transition()
			.duration(duration)
			.call(xAxis);

		updateBars();
	}


	/*	When a field button is clicked update the field variable to represent the selected 
		field and call updateDisplayArray() */
	d3.selectAll(".select-field input").on("change", function(){
		field = this.value;
		// updateBars();
		updateDisplayArray();
	});

	/* 	When the CC or AC buttons are clicked update the count variable
		and call updateDisplayArray() */
	d3.selectAll(".count-select input").on("change", function() {
		count = this.value;
		// updateBars();
		updateDisplayArray();
	});

	/* 	When the user changes the adjust scale checkbox update the var adjustScaleCheck
		boolean and call updateDisplayArray() */
	d3.selectAll(".adjust-scale input").on("change", function() {
		adjustScaleCheck = d3.select(this).property("checked");
		// updateBars();
		updateDisplayArray();
	});

	/*	function called copy the relevant year's data into the displayArray array
		then add a property called choice that holds the relevant count and field value */
	function updateDisplayArray() {

		displayArray = [];

		switch (displayYear) { 
			case "2008":
				displayArray = data.year2008;
				break;
			case "2009":
				displayArray = data.year2009;
				break;
			case "2010":
				displayArray = data.year2010;
				break;
			case "2011":
				displayArray = data.year2011;
				break;
			case "2012":
				displayArray = data.year2012;
				break; 											 
			default:
				displayArray = data.year2012;	
				break;		
		}

		if (count === "cc") {
			yScale.domain([0, d3.max(data.year2012, function(d) { return d.cc;} )]);
			switch (field) {
				case "all":
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].cc;
					};
					break;
				case "phys":
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].ccPhys;
					};				
					break;
				case "life":
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].ccLife;
					};
					break;
				case "earth":
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].ccEarth;
					};
					break;
				case "chem":
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].ccChem;
					};
				break;
				default:
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].cc;
					};										
			}
		} else if (count === "ac"){
			yScale.domain([0, d3.max(data.year2012, function(d) { return d.ac;} )]);
			switch (field) {
				case "all":
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].ac;
					};
					break;
				case "phys":
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].acPhys;
					};				
					break;
				case "life":
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].acLife;
					};
					break;
				case "earth":
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].acEarth;
					};
					break;
				case "chem":
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].acChem;
					};
				break;
				default:
					for (var i = 0; i < displayArray.length; i++) {
						displayArray[i].choice = displayArray[i].ac;
					};										
			}
		};

		// for (var i = 0; i < displayArray.length; i++) {
		// 	var countryName = displayArray[i].country;
		// };

		/* Try to loop through all the objects and remove them from the array if their corresponding
			chectbox is unchecked */

		if (d3.select(".country-select label [value=" + USA + "]").property("checked")) {
			console.log("Yes it's checked");
		} else (
			console.log("Nope it ain't!")
		);

		// d3.selectAll(".country-select label [value=USA]")
		// 	.style("opacity",0);

		updateBars();
	}

	/* 	Define Y scale range to go from height to 0
		Do not define the domaine yet */
	var yScale = d3.scale.linear()
		.range([height , 0]);

	//	Define Y axis
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.tickSize(3, 3)
		.orient("left");

	//	Prepare the Y axis but do not call .call(yAxis) yet
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	  .append("g")
		.attr("class", "axisLabel")
	  .append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -margin.left)
		.attr("x", -height/2)
		.attr("dy", ".9em")
		.style("text-anchor", "middle");						

	/* Define the X Ordinal Scale */
	var xScale = d3.scale.ordinal()
		.domain(data.year2012.map(function(d) { return d.country; }))
		.rangeRoundBands([margin.left,(width + margin.right)], 0.1);				

	//Define X axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.tickSize(3, 0)
		.orient("bottom");

	//Draw X axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + 0 + "," + (height + margin.top) + ")")
		.call(xAxis);			

	/*	Rotate the x axis text by 45 degrees so that it is legible */
	d3.selectAll(".x text")
		.attr("text-anchor", "left")
		.attr("transform", function(d) {
			return "translate(" + (this.getBBox().width / 2 ) + "," + 2 + "), rotate( 45 " + this.getBBox().x + " " + this.getBBox().y + ")";
		});





	/* Transition the height of the bars to the ac or the cc value */
	function updateBars() {

		/* Update the header */
		d3.select(".outer-wrapper #year").html([displayYear]);

		switch (count) { 
			case "cc":
				d3.select(".outer-wrapper #count").html(["Corrected count"]);
				displayCount = "Corrected count";
				break;
			case "ac":
				d3.select(".outer-wrapper #count").html(["Article count"]);
				displayCount = "Article count";
				break;
			default:
				d3.select(".outer-wrapper #count").html(["Corrected count"]);
				displayCount = "Corrected count";
			break;		
		}

		switch (field) {
			case "all":
				d3.select(".outer-wrapper #field").html(["All fields"]);
				displayField = "All fields";
				break;
			case "phys":
				d3.select(".outer-wrapper #field").html(["Physics"]);
				displayField = "Physics";
				break;
			case "life":
				d3.select(".outer-wrapper #field").html(["Life sciences"]);
				displayField = "Life sciences";
				break;
			case "earth":
				d3.select(".outer-wrapper #field").html(["Earth sciences"]);
				displayField = "Earth sciences";
				break;
			case "chem":
				d3.select(".outer-wrapper #field").html(["Chemistry"]);
				displayField = "Chemistry";
				break;
			default:
				d3.select(".outer-wrapper #field").html(["All fields"]);
				displayField = "All fields";
				break;																	
		}

		d3.selectAll(".y .axisLabel text")
			.text(displayCount + " " + displayYear + " " + displayField);

		if (adjustScaleCheck) {
			yScale.domain([0, d3.max(displayArray, function(d) { return d.choice;} )]);
		};

		//Select…
		var bars = svg.selectAll("rect")
				.data(displayArray, function(d, i) {
					return d.country;
				})

		/* Colour the bars and apply the tooltip function */
		bars.style("fill", allBars)
			.on("mouseover", function(d) {
				
				/*	Create a var to hold the tooltip text string */
				var tooltipText = "";

				/*	Find out if we are displaying the cc or the ac value
					and add the correct text to the tooltipText var */
				switch (count) { 
					case "cc":
						switch (field) {
							case "all":
								tooltipText =  "cc: " +  d.cc;
								break;
							case "phys":
								tooltipText =  "cc: " +  d.ccPhys;						
								break;
							case "life":
								tooltipText =  "cc: " +  d.ccLife;	
								break;
							case "earth":
								tooltipText =  "cc: " +  d.ccEarth;	
								break;
							case "chem":
								tooltipText =  "cc: " +  d.ccChem;	
							break;
							default:
								tooltipText =  "cc: " +  d.cc;
								break;																	
						}
						break;

					case "ac":
						switch (field) {
							case "all":
								tooltipText =  "ac: " +  d.ac;
								break;
							case "phys":
								tooltipText =  "ac: " +  d.acPhys;
								break;
							case "life":
								tooltipText =  "ac: " +  d.acLife;
								break;
							case "earth":
								tooltipText =  "ac: " +  d.acEarth;
								break;
							case "chem":
								tooltipText =  "ac: " +  d.acChem;
								break;
							default:
								tooltipText =  "ac: " +  d.ac;
								break;																	
						}
						break;
					default:
						tooltipText =  "cc: " +  d.cc;
						break;		
				}


				/* Update the tooltip text */
				d3.select(".tooltip")
					.select(".value")
					.html(d.country + "<br /> " + tooltipText);

				/* Get this bar's x/y values, then augment for the tooltip */
				var xPosition = parseInt(d3.select(this).attr("x")) - (parseInt($(".tooltip").css("width"))/2);
				var yPosition = parseInt(d3.select(this).attr("y") ) - (parseInt($(".tooltip").css("height"))) - 30;

				/* Update the tooltip position and value */
				d3.select(".tooltip")
					.style("left", xPosition + "px")
					.style("top", yPosition + "px");

				/* Show the tooltip */
				d3.select(".tooltip")
					.classed("hidden", false)
					.transition()
					.duration(duration)
					.style("opacity", 1);
			})
			.on("mouseout", function() {
				/* Hide the tooltip */
				d3.select(".tooltip")
					.transition()
					.duration(duration)
					.style("opacity", 0)
					.each("end", function() {
						d3.select(".tooltip").classed("hidden", true);
					});
			});


		//Enter…
		bars.enter()
			.append("rect")
			.attr("width", xScale.rangeBand())
			.attr("x", function(d, i){
				return xScale(i); 
			})
			.attr("y", function(d){
				return margin.top + yScale(d.choice); 
			})
			.attr("height", function(d){
				return height - yScale(d.choice);
			});

		//Update…
		bars.transition()
			.duration(duration)
			.attr("width", xScale.rangeBand())
			.attr("x", function(d, i){
				return xScale(i); 
			})
			.attr("y", function(d){
				return margin.top + yScale(d.choice); 
			})
			.attr("height", function(d){
				return height - yScale(d.choice);
			});
					
			//Exit…
			bars.exit()
				.transition()
				.style("opacity", 0)
				.remove();

		/* Call the Y axis to adjust it to the new scale */
		svg.select(".outer-wrapper .y")
			.transition()
			.duration(duration)
			.call(yAxis);


	}

	/* Build the slider */
	makeYearSlider();

	/* An inital call of updateDisplayArray()  */
	updateDisplayArray();




}





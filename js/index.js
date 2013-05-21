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
var displayYear = "2012";
/*	Global Array to hold all the data we currently want to display */
var displayArray = [];
var yearArray = [];
var checkArray = [];
/*	Arrays used to build the country and continent checkboxes */
var continentArray = [];
var uniqueContinentArray = [];
/*	Global variables to control field and count text in axis label */
var displayCount = "Corrected count";
var displayField = "All fields";
/*	Colours for the bars */
var allBars = "#E67E22";
/*	A var to determine if the scale should be adjustedq */
			
/*	Create SVG element */
var svg = d3.select(".count-chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

/* Add a group for each row the text */
var blocks = svg.append("g")
	.style("fill", allBars);

/* Add a group for each row the text */
var groups = svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(" + 0 + "," + (height + margin.top + 15) + ")");

/* Create JqueryUI buttons */
function buildUIelements() {
	$( "#check" ).button();
	$( ".count-select" ).buttonset();
	$( ".select-field" ).buttonset();
	// $( ".country-select" ).buttonset();
};

/* Create custom checkboxes */
function setupLabel() {
	var checkBox = ".checkbox";
	var checkBoxInput = checkBox + " input[type='checkbox']";
	var checkBoxChecked = "checked";

	if ($(checkBoxInput).length) {
		$(checkBox).each(function(){
			$(this).removeClass(checkBoxChecked);
		});
		$(checkBoxInput + ":checked").each(function(){
			$(this).parent(checkBox).addClass(checkBoxChecked);
		});
    };
};

/*	Function to sort data.year200X by country name */
function compareCountry(a,b) {
  if (a.country < b.country)
     return -1;
  if (a.country > b.country)
    return 1;
  return 0;
}

/*	Load in JSON data then call draw() */
d3.json('data/ranking-country-global.json', draw);

/*	The draw function is called only once the JSON file has fully loaded 
	and is responsible for building the barchart */
function draw(data) {

	/* store this number to use to create a staggered transition */
	var numberOfBars = data.year2008.length;

	/*	Create an array containing each continent and the use $.each and $.inArray
		to remove all duplicates. The result will be stored in uniqueContinentArray */
	for (var i = 0; i < numberOfBars; i++) {
		continentArray.push(data.year2008[i].continent);
	};

	$.each(continentArray, function(i, el){
		if($.inArray(el, uniqueContinentArray) === -1) {
			uniqueContinentArray.push(el);
		}
	});

	/* Create checkboxes for each continent inside the continent-select form */
	d3.selectAll(".continent-select")
		.selectAll("label")
		.data(uniqueContinentArray.sort())
		.enter()
		.append("label")
		.attr("class", "checkbox")
		.html(function (d) {
			var continentString = d.replace(/_/g, ' ');
    		return "<input type='checkbox' value='" + d + "' data-continent='" + d + "' checked>" + continentString;
		});


	/* Create checkboxes for each country inside the country-select form */
	d3.selectAll(".country-select")
		.selectAll("label")
		.data(data.year2008.sort(compareCountry))
		.enter()
		.append("label")
		.attr("class", "checkbox")
		.html(function (d) {
			var countryString = d.country.replace(/_/g, ' ');
    		return "<input type='checkbox' value='" + d.country + "' data-continent='" + d.continent + "' checked>" + countryString;
		});

	/* Add a span containing the svg circle to replace the checkbox icon */
	$(".checkbox").prepend("<span class='icon'>	<svg height='20' width='20'><circle cx='10' cy='10' r='10' class='dots'></circle></svg></span>");

	$(".checkbox").click(function(){
		setupLabel();
	});

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
				updateDisplayArray()
			}
		});
		$( ".select-year" ).change(function() {
			slider.slider( "value", this.selectedIndex + 1 );
		});
	};

	/*	When a field button is clicked update the field variable to represent the selected 
		field and call updateDisplayArray() */
	d3.selectAll(".select-field input").on("change", function(){
		field = this.value;
		updateDisplayArray();
	});

	/* 	When the CC or AC buttons are clicked update the count variable
		and call updateDisplayArray() */
	d3.selectAll(".count-select input").on("change", function() {
		count = this.value;
		updateDisplayArray();
	});

	/*	Call updateDisplayArray() when one of the country checkboxes is clicked */
	d3.selectAll(".country-select input").on("change", updateDisplayArray);

	/*	Call updateContinent() when one of the checkboxes is clicked */
	d3.selectAll(".continent-select input").on("change", updateContinent);	

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

	/* 	Define Y scale range to go from height to 0
		Do not define the domaine yet */
	var yScale = d3.scale.linear()
		.range([height , 0]);

	/*	Define Y axis */
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.tickSize(3, 3)
		.orient("left");

	/*	Prepare the Y axis but do not call .call(yAxis) yet */
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

	var xScale = d3.scale.ordinal()
		.domain(d3.range(data.year2012.length))
		.rangeRoundBands([margin.left,(width + margin.right)], 0.1);

	function updateContinent() {
		var thisContinent = $(this).val();
		console.log(thisContinent);
	}			

	/*	function called copy the relevant year's data into the displayArray array
		then add a property called choice that holds the relevant count and field value */
	function updateDisplayArray() {

		var thisContinent = $(this).data('continent');
		console.log(thisContinent);

		displayArray = [];
		yearArray = [];
		checkArray = [];

		switch (displayYear) { 
			case "2008":
				yearArray = data.year2008.slice(0);
				break;
			case "2009":
				yearArray = data.year2009.slice(0);
				break;
			case "2010":
				yearArray = data.year2010.slice(0);
				break;
			case "2011":
				yearArray = data.year2011.slice(0);
				break;
			case "2012":
				yearArray = data.year2012.slice(0);
				break; 											 
			default:
				yearArray = data.year2012.slice(0);
				break;		
		}


		for (var i = 0; i < yearArray.length; i++) { 
				checkArray.push({});
		}

		if (count === "cc") {
			switch (field) {
				case "all":
					for (var i = 0; i < checkArray.length; i++) {

						checkArray[i].choice = yearArray[i].cc;
						checkArray[i].country = yearArray[i].country;
					};
					break;
				case "phys":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ccPhys;
						checkArray[i].country = yearArray[i].country;
					};				
					break;
				case "life":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ccLife;
						checkArray[i].country = yearArray[i].country;
					};
					break;
				case "earth":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ccEarth;
						checkArray[i].country = yearArray[i].country;
					};
					break;
				case "chem":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ccChem;
						checkArray[i].country = yearArray[i].country;
					};
				break;
				default:
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].cc;
						checkArray[i].country = yearArray[i].country;
					};										
			}
		} else if (count === "ac"){
			switch (field) {
				case "all":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ac;
						checkArray[i].country = yearArray[i].country;
					};
					break;
				case "phys":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].acPhys;
						checkArray[i].country = yearArray[i].country;
					};				
					break;
				case "life":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].acLife;
						checkArray[i].country = yearArray[i].country;
					};
					break;
				case "earth":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].acEarth;
						checkArray[i].country = yearArray[i].country;
					};
					break;
				case "chem":
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].acChem;
						checkArray[i].country = yearArray[i].country;
					};
				break;
				default:
					for (var i = 0; i < checkArray.length; i++) {
						checkArray[i].choice = yearArray[i].ac;
						checkArray[i].country = yearArray[i].country;
					};										
			}
		};



		for (var i = 0; i < checkArray.length; i++) {
			var countryName = checkArray[i].country;

			if (d3.select(".country-select [value=" + countryName + "]").property("checked")) {
				displayArray.push(checkArray[i]);
			}
		};

		updateBars();
		updateHeader();
	}


	/* Transition the height of the bars to the ac or the cc value */
	function updateBars() {
		yScale.domain([0, d3.max(displayArray, function(d) { return d.choice;} )]);

		xScale.domain(d3.range(displayArray.length))
			.rangeRoundBands([margin.left,(width + margin.right)], 0.1);			

		/*	Select… */
		var bars = blocks.selectAll("rect")
				.data(displayArray, function(d, i) {
					return d.country;
				});

		/* Enter… */
		bars.enter()
			.append("rect")
			.transition()
			.duration(duration)
			.attr("x", function(d, i){
				return xScale(i); 
			})
			.attr("width", xScale.rangeBand())
			.attr("y", function(d){
				return margin.top + yScale(d.choice); 
			})
			.attr("height", function(d){
				return height - yScale(d.choice);
			});			

		/* 	Update… */
		bars.sort(function(a, b) {
			return d3.descending(a.choice, b.choice);
			})
			.transition()
			.duration(duration)
			.attr("x", function(d, i){

				return xScale(i); 
			})
			.attr("width", xScale.rangeBand())
			.attr("y", function(d){
				return margin.top + yScale(d.choice); 
			})
			.attr("height", function(d){
				return height - yScale(d.choice);
			});	

		/*	Exit… */
		bars.exit()
			.transition()
			.style("opacity", 0)
			.remove();


		var text = groups.selectAll("text")
			.data(displayArray);

		text.sort(function(a, b) {
			return d3.descending(a.choice, b.choice);
		});


		/* Update…	*/
		text.text(function(d) { return d.country; })
			.attr("y", 0)
			.attr("x", function(d, i){
				return xScale(i); 
			});

		/*	Enter… */
		text.enter()
			.append("text")
			.text(function(d) { return d.country; })
			.attr("y", 0)
			.attr("x", function(d, i){
				return xScale(i); 
			});				
	
		/* Exit… */
		text.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();
					
		/*	Rotate the x axis text by 45 degrees so that it is legible */
		d3.selectAll(".x text")
			.attr("text-anchor", "left")
			.attr("transform", function(d, i) {
				return "translate(" + (xScale.rangeBand() / 2 ) + "," + 2 + "), rotate( 45 " + xScale(i) + " " + this.getBBox().y + ")";

			});



		/* Call the Y axis to adjust it to the new scale */
		svg.select(".outer-wrapper .y")
			.transition()
			.duration(duration)
			.call(yAxis);
			
		/* Colour the bars and apply the tooltip function */
		bars.on("mouseover", function(d) {
				
				/*	Create a var to hold the tooltip text string */
				var tooltipText = "";
				var countryString = d.country.replace(/_/g, ' ');

				/*	Find out if we are displaying the cc or the ac value
					and add the correct text to the tooltipText var */
				count === "cc" ? tooltipText =  "cc: " +  d.choice : tooltipText =  "ac: " +  d.choice;;

				/* Update the tooltip text */
				d3.select(".tooltip")
					.select(".value")
					.html(countryString + "<br /> " + tooltipText);

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

	}

	function updateHeader() {
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
	}

	/* Build the slider */
	makeYearSlider();

	/* An inital call of updateDisplayArray()  */
	updateDisplayArray();

	/* Build the jQueryUI elements */
	buildUIelements();

	/* Build the custom checkboxes */
	setupLabel();

}






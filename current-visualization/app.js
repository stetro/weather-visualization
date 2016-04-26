$(function() {
	d3.json("data.json", function(error, data) {
		// settings
		var width = 575,
			height = 500,
			marginTop = 45,
			marginLeft = 25;

		// adding svg element to body and apply settings
		var container = d3.select("#diagram").append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + marginLeft + "," + marginTop + ")");

		setCurrentWeatherInformation(data, "Köln", container);
		setCurrentWeatherGraph(data, container);
		addWeekdays(data, container);

		$("button").click(function() {

		});

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(pos) {
				console.log(pos);
				console.log(data);
			});
		}

	});



	function mapWeatherToIconContent(iconName) {
		switch (iconName) {
			case "clear-day":
				return "\uf00d";
			case "clear-night":
				return "\uf02e";
			case "rain":
				return "\uf008";
			case "snow":
				return "\uf00a";
			case "sleet":
				return "\uf0b2";
			case "wind":
				return "\uf085";
			case "fog":
				return "\uf014";
			case "cloudy":
				return "\uf041";
			case "partly-cloudy-day":
				return "\uf002";
			case "partly-cloudy-night":
				return "\uf086";
			default:
				return "";
		}
	}


	function setCurrentWeatherGraph(data, container) {
		var chartHeight = 60;
		var chartPosition = 210;

		// remove current visualization if already available
		container.selectAll("g#graph").remove();
		container = container.append("g").attr("id", "graph");
		container.style("opacity", 0.0).transition().style("opacity", 1.0);

		// linechart scales
		var temperatureAccessor = function(d) {
			return d.temperature;
		}

		var xScale = d3.time.scale().range([0, 525])
			.domain([
				moment.tz(data.hourly.data[0].time * 1000, data.timezone),
				moment.tz(data.hourly.data[23].time * 1000, data.timezone)
			]);
		var yScale = d3.scale.linear().range([0, chartHeight])
			.domain([
				d3.min(data.hourly.data.slice(0, 24), temperatureAccessor),
				d3.max(data.hourly.data.slice(0, 24), temperatureAccessor) + 5
			]);

		// linechart axis
		var xAxisTime = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(d3.time.hours, 3)
			.tickSize([0, 0])
			.tickFormat(function(d) {
				return moment(d).format("HH:mm")
			});

		var xAxisTemperature = d3.svg.axis()
			.scale(yScale)
			.orient("top")
			.ticks(d3.time.hours, 3)
			.tickSize([0, 0]);

		// chart with line and background area
		var line = d3.svg.line().interpolate("basis")
			.x(function(d) {
				return xScale(moment.tz(d.time * 1000, data.timezone));
			})
			.y(function(d) {
				return yScale(d.temperature);
			});

		var area = d3.svg.area()
			.x(function(d) {
				return xScale(moment.tz(d.time * 1000, data.timezone));
			})
			.y0(chartHeight)
			.y1(function(d) {
				return yScale(d.temperature);
			});

		// draw both
		container.append("path")
			.datum(data.hourly.data.slice(0, 24))
			.attr("class", "area")
			.attr("d", area)
			.attr("transform", "translate(0," + chartPosition + ")");
		container.append("path")
			.datum(data.hourly.data.slice(0, 24))
			.attr("class", "line")
			.attr("d", line)
			.attr("transform", "translate(0," + chartPosition + ")");

		// draw xAxisTime
		container.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (chartPosition + 10 + chartHeight) + ")")
			.call(xAxisTime)
			.selectAll("text")
			.style("text-anchor", "start");;

	}

	function addWeekdays(data, container) {
		var dayPosition = 320;

		// remove current visualization if already available
		container.selectAll("g#weekdays").remove();
		container = container.append("g").attr("id", "weekdays");
		container.style("opacity", 0.0).transition().style("opacity", 1.0);

		var dayWidth = 65;

		// days
		var day = container.selectAll("g")
			.data(data.daily.data)
			.enter()
			.append("g");

		// highlight
		day.append("rect")
			.attr("class", "dayRect")
			.attr("x", function(day, index) {
				return index * dayWidth;
			})
			.attr("y", dayPosition)
			.attr("width", dayWidth)
			.attr("height", 100);

		// day name
		day.append("text")
			.text(function(day) {
				return moment.tz(day.time * 1000, data.timezone).format("dd.")
			})
			.attr("class", "dayName")
			.attr("y", dayPosition + 20)
			.attr("x", function(day, index) {
				return index * dayWidth + 30;
			});

		// day icon
		day.append("text")
			.text(function(day) {
				return mapWeatherToIconContent(day.icon);
			})
			.attr("class", "dayIcon")
			.attr("y", dayPosition + 65)
			.attr("x", function(day, index) {
				return index * dayWidth + 30;
			});

		// day temperatures
		var dayTemperatures = day.append("text")
			.attr("y", dayPosition + 90)
			.attr("class", "dayTemperatures")
			.attr("x", function(day, index) {
				return index * dayWidth + 30;
			});
		dayTemperatures.append("tspan")
			.text(function(day) {
				return numeral(day.temperatureMax).format('0') + "\u00B0"
			})
			.attr("class", "dayTemperatureMax");
		dayTemperatures.append("tspan")
			.text(function(day) {
				return numeral(day.temperatureMin).format('0') + "\u00B0"
			})
			.attr("dx", 4)
			.attr("class", "dayTemperatureMin");
	}

	function setCurrentWeatherInformation(data, location, container) {
		// remove current visualization if already available
		container.selectAll("g#current").remove();
		container = container.append("g").attr("id", "current");
		container.style("opacity", 0.0).transition().style("opacity", 1.0);

		// title
		container.append("text")
			.attr("class", "title")
			.attr("x", 0)
			.attr("y", 0)
			.text(location);

		// summary
		var summary = container.append("text")
			.attr("class", "summary")
			.attr("x", 0)
			.attr("y", 25);
		summary.append("tspan")
			.attr("x", 0)
			.text(moment.tz(data.currently.time * 1000, data.timezone).format('dddd, HH:mm'));
		summary.append("tspan")
			.attr("x", 0)
			.attr("dy", "1.4em")
			.text(data.currently.summary);

		// detail
		var detail = container.append("text")
			.attr("class", "detail")
			.attr("x", 225)
			.attr("y", 100);
		detail.append("tspan")
			.attr("x", 225)
			.text("Precipitation: " + numeral(data.currently.precipIntensity * 100).format('0.0') + "%");
		detail.append("tspan")
			.attr("x", 225)
			.attr("dy", "1.4em")
			.text("Humidity: " + numeral(data.currently.humidity * 100).format('0.0') + "%");
		detail.append("tspan")
			.attr("x", 225)
			.attr("dy", "1.4em")
			.text("Windspeed: " + numeral(data.currently.windSpeed).format('0.0') + " km/h");

		// weather icon
		var icon = container.append("text")
			.attr("class", "icon")
			.attr("x", 0)
			.attr("y", 130)
			.text(mapWeatherToIconContent(data.currently.icon));

		// degree 
		var degree = container.append("text")
			.attr("x", 70)
			.attr("y", 130);
		degree.append("tspan")
			.attr("class", "degree")
			.text(numeral(data.currently.temperature).format('0'));
		degree.append("tspan")
			.attr("class", "unit")
			.attr("dy", "-1.6em")
			.attr("dx", "0.5em")
			.text("C\u00B0");
	}

});
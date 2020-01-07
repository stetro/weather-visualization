$(function() {
	d3.json("data19.json", function(error, data) {

		// settings
		var width = 600,
			height = 600,
			radius = Math.min(width, height) / 2 - 60;

		// scales and generated values
		var degree = d3.scale.linear()
			.domain([-25, 49])
			.range([0, radius]);

		var rainfall = d3.scale.linear()
			.domain([0.0, 30.0])
			.range([0, 35])

		var time = d3.time.scale()
			.domain([new Date(2015, 0, 1), new Date(2015, 11, 31)])
			.range([-90, 270]);

		var months = time.ticks(d3.time.month);
		var days = time.ticks(d3.time.day);
		var colors = tinygradient(
			[{
				color: 'blue',
				pos: 0.40
			}, {
				color: 'green',
				pos: 0.46
			}, {
				color: 'yellow',
				pos: 0.6
			}, {
				color: 'red',
				pos: 0.8
			}]).rgb(Math.floor(radius), true);

		var line = d3.svg.line.radial()
			.radius(function(d) {
				return degree(d[1]);
			})
			.angle(function(d) {
				return -d[0] + Math.PI / 2;
			});

		// adding svg element to body and apply settings
		var svg = d3.select("#diagram").append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		// draw radial month axis with labels
		var monthAxis = svg.append("g")
			.attr("class", "a axis month")
			.selectAll("g")
			.data(months)
			.enter().append("g")
			.attr("transform", function(d) {
				return "rotate(" + time(d) + ")";
			});

		monthAxis.append("line")
			.attr("x2", radius);

		monthAxis.append("text")
			.attr("x", radius + 6)
			.attr("dy", ".25em")
			.style("text-anchor", function(month) {
				d = time(month);
				return d < 270 && d > 90 ? "end" : null;
			})
			.attr("transform", function(month) {
				d = time(month);
				return d < 270 && d > 90 ? "rotate(180 " + (radius + 6) + ",0)" : null;
			})
			.text(function(month) {
				return moment(month).format('MMM');
			});

		// draw radial degree axis with labels
		var degreeAxis = svg.append("g")
			.attr("class", "r axis degree")
			.selectAll("g")
			.data(degree.ticks(5).slice(1))
			.enter().append("g");

		degreeAxis.append("circle")
			.attr("r", degree);

		degreeAxis.append("rect")
			.attr("width", function (d) {
				return 20;
			})
			.attr("height", function (d) {
				return 10;
			})
			.attr("y", function (d) {
				return -degree(d)-5;
			})
			.attr("x", function (d) {
				return -10;
			});
		degreeAxis.append("text")
			.attr("y", function(d) {
				return -degree(d)+4;
			})
			.style("text-anchor", "middle")
			.text(function(d) {
				return d + "°";
			});

		// draw radial day plots with teperature and rainfall
		var dayPlot = svg.append("g")
			.attr("class", "a day")
			.selectAll("g")
			.data(days)
			.enter().append("g")
			.attr("transform", function(day) {
				return "rotate(" + time(day) + ")";
			});

		dayPlot.append("circle")
			.attr("cx", function(day) {
				day = moment(day);
				return degree(data[day.format('MM')][day.format('DD')].to - 4.0);
			})
			.attr("r", function(day) {
					day = moment(day);
				return rainfall(data[day.format('MM')][day.format('DD')].rainfall);
			})

		dayPlot.append("line")
			.attr("x2", function(day) {
				day = moment(day);
				return degree(data[day.format('MM')][day.format('DD')].from);
			})
			.attr("x1", function(day) {
				day = moment(day);
				return degree(data[day.format('MM')][day.format('DD')].to);
			})
			.attr("style", function(day) {
				day = moment(day);
				return "stroke:" + colors[Math.floor(degree(data[day.format('MM')][day.format('DD')].to))] + " ;"
			});

		// adding a measurement description
		svg.append("text")
			.attr("class", "title")
			.attr("text-anchor", "middle")
			.attr("y", 0)
			.text(data.location);

		svg.append("text")
			.attr("class", "subtitle")
			.attr("text-anchor", "middle")
			.attr("y", 17)
			.text(data.station);
	});
});

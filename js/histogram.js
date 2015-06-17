"use strict";


$.widget("tyevans.histogram", {
    options: {
        data: null,
        width: null,
        height: null,
        transitionTime: 750,
        labelField: "label",
        valueField: "value",
        yAxisLabel: "",
        autoResize: true,
        colorFunction: d3.scale.category10(),
        showValues: true,
        barClass: "bar",
        xAxisClass: "x axis",
        yAxisClass: "y axis",
    },

    _create: function () {
        var self = this;
        this.d3 = {};
        this.selector = "#" + this.element.attr("id");

        this._set_dimensions();

        this._svg = d3.select(this.selector).append("svg")
            .classed({"chart-container": true})
            .attr("width", this.options.width)
            .attr("height", this.options.height);

        this.svg = this._svg.append("g").attr("transform", "translate(45,5)");

        if (this.options.autoResize) {
            $(window).on("resize", function() {
                self._resize();
            });
        }
    },

    _init: function () {
        this.data = this.options.data;
        this._set_range();
        this._set_domain();
        this._draw();
    },

    _resize: function () {
        this._set_dimensions();
        this._svg
            .attr("width", this.options.width)
            .attr("height", this.options.height);

        this._set_range();
        this._set_domain();

        this.d3.xAxis.scale(this.d3.x);
        this.d3.yAxis.scale(this.d3.y);

        var transitionTime = this.options.transitionTime;
        this.options.transitionTime = 0;

        this._update_xaxis();
        this._update_yaxis();
        this._draw_bars();
        if (this.options.showValues) {
            this._draw_values();
        }
        this.options.transitionTime = transitionTime;
    },

    _set_dimensions: function () {
        this.options.width = this.element.width();
        this.options.height = this.element.height();
    },

    _set_range: function () {
        this.d3.x = d3.scale.ordinal()
            .rangeRoundBands([30, this.options.width - 60], .1);

        this.d3.y = d3.scale.linear()
            .range([this.options.height - 30, 30]);

    },

    _set_domain: function () {
        var self = this;
        this.d3.x.domain(this.data.map(function (d) {
            return d[self.options.labelField];
        }));

        this.d3.y.domain([0, d3.max(this.data, function (d) {
            return d[self.options.valueField];
        })]);
    },

    _draw_xaxis: function () {
        this.svg.append("g")
            .attr("class", this.options.xAxisClass)
            .attr("transform", "translate(0," + (this.options.height - 25) + ")")
            .call(this.d3.xAxis);
    },

    _draw_yaxis: function () {
        this.svg.append("g")
            .attr("class", this.options.yAxisClass)
            .call(this.d3.yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("x", -30)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(this.options.yAxisLabel);
    },

    _update_xaxis: function () {
        this.svg.select(".x.axis")
            .transition().duration(this.options.transitionTime)
            .call(this.d3.xAxis);
    },

    _update_yaxis: function () {
        this.svg.select(".y.axis")
            .transition().duration(this.options.transitionTime)
            .call(this.d3.yAxis);
    },

    _draw_bars: function () {
        var self = this;
        var bars = this.svg.selectAll(".bar")
            .data(this.data);

        bars.enter().append("rect")
            .attr("class", this.options.barClass)
            .style("fill", function (datum, index) { return self.options.colorFunction(index); })
            .attr("y", function (d) { return self.options.height -  30; })
            .attr("height", 0);

        bars.exit()
            .transition().duration(this.options.transitionTime)
            .attr("y", function (d) { return self.options.height -  30; })
            .attr("height", 0)
            .remove();

        bars.transition().duration(this.options.transitionTime)
            .attr("width", this.d3.x.rangeBand())
            .attr("x", function (d) { return self.d3.x(d[self.options.labelField]); })
            .attr("y", function (d) { return self.d3.y(d[self.options.valueField]); })
            .attr("height", function (d) { return self.options.height - self.d3.y(d[self.options.valueField]) - 30; });
    },

    _draw_values: function () {
        var self = this;
        var values = this.svg.selectAll("text.value")
            .data(this.data);

        values.enter().append("text")
            .attr("class", "value")
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .attr("y", function () { return self.options.height -50; });

        values.exit()
            .remove();

        values.transition().duration(this.options.transitionTime)
            .attr("x", function (d) {
                return self.d3.x(d[self.options.labelField]) + (self.d3.x.rangeBand() / 2);
            })
            .attr("y", function (d) {
                return self.d3.y(d[self.options.valueField]) - 20;
            })
            .text(function (d) {
                return d[self.options.valueField];
            });

    },

    _draw: function () {
        this.d3.xAxis = d3.svg.axis()
            .scale(this.d3.x)
            .orient("bottom");
        this.d3.yAxis = d3.svg.axis()
            .scale(this.d3.y)
            .orient("left")
            .ticks(10);

        this._draw_xaxis();
        this._draw_yaxis();
        this._draw_bars();
        if (this.options.showValues) {
            this._draw_values();
        }
    },

    _update: function() {
        this._set_dimensions();
        this._set_domain();
        this._update_xaxis();
        this._update_yaxis();
        this._draw_bars();

        if (this.options.showValues) {
            this._draw_values();
        }
    },

    setData: function (data) {
        this.data = data;
    },

    draw: function() {
        this._update();
    },

    update: function(data) {
        this.data = data;
        this._update();
    }
});

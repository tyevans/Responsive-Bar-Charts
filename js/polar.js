"use strict";

// Stash the old values for transition.
function stash(d) {
    d.value0 = d.value;
}

$.widget("tyevans.polar", {

    options: {
        data: {},
        width: null,
        height: null,
        transitionTime: 750,
        autoResize: true,
        colorFunction: d3.scale.category10(),
        showValues: true,
        padding: 5,
        backgroundColor: "#eee",
        backgroundStroke: "#fff",
        stroke: "#fff"
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

        this.svg = this._svg.append("g").attr("transform", "translate(" + this.options.width * .5 + "," + this.options.height * .5 + ")");

        if (this.options.autoResize) {
            $(window).on("resize", function () {
                self._resize();
            });
        }
    },

    _init: function () {
        this.data = this.options.data;
        this._draw();
    },

    _resize: function () {
    },

    _set_dimensions: function () {
        var width = this.element.width();
        var height = this.element.height();
        var dimension = (width > height ? height : width);
        this.options.width = dimension;
        this.options.height = dimension;
        this.options.radius = (dimension / 2) - 5;
    },

    _draw: function () {
        var self = this;

        var directions = [
            "N",
            "NNE",
            "NE",
            "ENE",
            "E",
            "ESE",
            "SE",
            "SSE",
            "S",
            "SSW",
            "SW",
            "WSW",
            "W",
            "WNW",
            "NW",
            "NNW",
        ];

        var oData = this.options.data;
        var data = [];
        var maxDistance = 0;

        // Figure out how many rings we'll need to draw
        for (var key in oData) {
            if (!oData.hasOwnProperty(key)) {
                continue;
            }
            var len = oData[key].length;
            if (len > maxDistance) {
                maxDistance = len;
            }
        }

        for (var i = 0; i < maxDistance; i++) {
            data.push([]);
        }

        var segmentWidth = this.options.radius / maxDistance;

        $.each(directions, function (index, direction) {
            var dirData = oData[direction];

            if (dirData === undefined) {
                var localDistance = 0;
            } else {
                var localDistance = dirData.length;
            }

            var missingValues = maxDistance - localDistance;
            for (var i = 0; i < missingValues; i++) {
                dirData.push(0);
            }

            $.each(dirData, function (i, value) {
                data[i].push(value);
            });
        });

        $.each(data, function (i, values) {
            $.each(values, function (j, value) {
                data[i][j] = {
                    "value": value,
                    "startAngle": self._getAngle(j),
                    "endAngle": self._getAngle(j) + 0.392
                }
            });
        });

        var maxVal = d3.max(data, function (row) {
            return d3.max(row, function (d) {
                return d.value;
            });
        });

        var color = d3.scale.linear()
            .domain([0, maxVal *.33, maxVal *.66, maxVal])
            .range(["#fff", "#2CA02C", "#FFAF00", "#D62728"]);

        $.each(data, function (index, values) {
            var innerRadius = segmentWidth * index;
            var outerRadius = (segmentWidth * (index + 1));

            var scale2 = d3.scale.linear()
                .domain([0, d3.max(values, function (d) {
                    return d.value;
                })])
                .range([0, 0.392]);


            var scale = d3.scale.linear()
                .domain([0, d3.max(values, function (d) {
                    return d.value;
                })])
                .range([innerRadius, outerRadius]);

            var lowerArc = d3.svg.arc()
                .startAngle(function (d) {
                    return d.startAngle
                })
                .endAngle(function (d) {
                    return d.endAngle;
                })
                .outerRadius(outerRadius)
                .innerRadius(innerRadius);

            var outerArc = d3.svg.arc()
                .startAngle(function (d) {
                    return d.startAngle
                })
                .endAngle(function (d) {
                    return d.endAngle;
                })
                .outerRadius(function (d) {
                    return scale(d.value);
                })
                .innerRadius(innerRadius);

            // Interpolate the arcs in data space.
            function arcTween(a) {
                var i = d3.interpolate({value: a.value0}, a);
                return function (t) {
                    var b = i(t);
                    a.value0 = b.value;
                    return outerArc(b);
                };
            }

            var arcClass = ".arc-" + index;
            var innerArcClass = arcClass + "-inner";
            var outerArcClass = arcClass + "-outer";

            var innerArcs = self.svg.selectAll(innerArcClass)
                .data(values);

            innerArcs.enter().append("path")
                .attr("class", innerArcClass)
                .attr("d", lowerArc)
                .style("stroke", self.options.backgroundStroke)
                .style("fill", self.options.backgroundColor)
                .style("fill-rule", "evenodd");

            var outerArcs = self.svg.selectAll(outerArcClass)
                .data(values);

            outerArcs.enter().append("path")
                .attr("class", outerArcClass)
                //.attr("d", outerArc)
                //.style("stroke", self.options.stroke)
                .style("fill", function (d) {
                    return color(d.value);
                })
                .style("fill-rule", "evenodd")
                .each(stash);

            outerArcs.transition().duration(self.options.transitionTime)
                .attr("d", outerArc);

        });
    },

    _getAngle: function (i) {
        switch (i) {
            case 0:
                return -0.196;
            case 1:
                return 0.196;
            case 2:
                return 0.588;
            case 3:
                return 0.980;
            case 4:
                return 1.372;
            case 5:
                return 1.764;
            case 6:
                return 2.156;
            case 7:
                return 2.548;
            case 8:
                return 2.94;
            case 9:
                return 3.332;
            case 10:
                return 3.723;
            case 11:
                return 4.116;
            case 12:
                return 4.508;
            case 13:
                return 4.9;
            case 14:
                return 5.292;
            case 15:
                return 5.684;
            case 16:
                return 6.076;
        }
    },


    _update: function () {
        this._set_dimensions();
        this._draw();
    },

    setData: function (data) {
        this.data = data;
    },

    draw: function () {
        this._update();
    },

    update: function (data) {
        this.options.data = data;
        this._update();
    }
});

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
(function (global) {
  'use strict';

  var d3 = global.d3;

  function Scale (chart) {
    this.chart = chart;
    this.x = d3.scale.linear();
    this.y = d3.scale.linear();
  }

  Scale.prototype = {
    update: function () {
      var extent = d3.extent(this.chart.data);
      var extentPadding = (extent[1] - extent[0]) / 4;

      this.x
        .range([this.left, this.right])
        .domain([0, this.chart.test.maxLength - 1]);

      this.y
        .range([this.bottom, this.top])
        .domain([
          extent[0] - extentPadding,
          extent[1] + extentPadding,
        ]);
    },

    get top () {
      return 10;
    },

    get bottom () {
      return this.height - 10;
    },

    get left () {
      return 10;
    },

    get right () {
      return this.width - 10;
    },

    get width () {
      if (!this.chart.element.parentNode) {
        return 0;
      }

      return this.chart.element.parentNode
        .getBoundingClientRect().width;
    },

    get height () {
      if (!this.chart.element.parentNode) {
        return 0;
      }

      return this.chart.element.parentNode
        .getBoundingClientRect().height;
    },
  };


  function Line (chart) {
    this.chart = chart;
    this.root = chart.svg;

    this.container = this.root
      .append('g')
      .classed('line-container', true);

    this.line = this.container
      .append('path')
      .classed('line-path', true);
  }

  Line.prototype = {
    update: function () {
      this.line
        .datum(this.chart.data)
        .attr('d', this.pathGenerator);
    },

    get pathGenerator () {
      var scale = this.chart.scale;

      return d3.svg.line()
        .interpolate('cardinal')
        .x(function (datum, index) {
          return scale.x(index);
        })
        .y(scale.y);
    }
  };


  function Sparkline (test) {
    this.test = test;

    window.addEventListener('resize', this.update.bind(this));

    this.svg = d3.select(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    ).attr('width', '100%')
     .attr('height', '100%');

    this.components = [
      (this.scale = new Scale(this)),
      new Line(this),
    ];
  }

  Sparkline.prototype = {
    get element () {
      return this.svg.node();
    },

    get data () {
      return this.test.series;
    },

    update: function () {
      this.components.forEach(function (component) {
        component.update();
      });
    }
  };

  global.Sparkline = Sparkline;
})(this);

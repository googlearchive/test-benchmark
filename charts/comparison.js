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

  function ColumnScale (chart) {
    this.chart = chart;
    this.x = d3.scale.linear();
    this.y = d3.scale.linear();

    window.scale = this;
  }

  ColumnScale.prototype = {
    update: function () {
      this.x
        .range(this.xRange)
        .domain([
          0, this.maxColumns
        ]);

      this.y
        .range([this.top, this.bottom])
        .domain(this.yDomain);
    },

    groupX: function (group) {
      var groupedData = this.chart.analysis.groupedData;
      var groupIndex = groupedData.indexOf(group);

      var groupColumn = groupedData.reduce(function (column, group, index) {
        if (index >= groupIndex) {
          return column;
        }

        return column +
          group.length +
          this.columnGroupGap;
      }.bind(this), 0);

      return this.x(groupColumn) -
        this.xRange[0] +
        this.xCenterOffset;

    },

    relativeValue: function (datum) {
      return datum.average - this.chart.analysis.baseline;
    },

    relativeRatio: function (datum) {
      return this.relativeValue(datum) / this.chart.analysis.baseline;
    },

    get maxColumns () {
      return this.chart.analysis.groupedData.length < 10 ? 40 : 80;
    },

    get maxColumnIndex () {
      return this.chart.analysis.groupedData.reduce(function (sum, group, index, list) {
        return sum + group.length + this.columnGroupGap;
      }.bind(this), 0);
    },

    get columnGroupGap () {
      return 2;
    },

    get columnWidth () {
      return this.xSize / this.maxColumns;
    },

    get top () {
      return 20;
    },

    get bottom () {
      return this.chart.height - 20;
    },

    get yDomain () {
      var yAbsoluteMaximum =
        this.chart.analysis.maximumAbsoluteDeviation +
        this.yPadding;

      return [
        -yAbsoluteMaximum,
        yAbsoluteMaximum
      ];
    },

    get yPadding () {
      return this.chart.analysis.maximumAbsoluteDeviation * 0.05;
    },

    get yAxisLeft () {
      return this.xRange[0] +
        this.xCenterOffset +
        this.columnWidth * (
          this.maxColumnIndex +
          this.columnGroupGap
        );
    },

    get yAxisTicksLeft () {
      return this.yAxisLeft + 6;
    },

    get xCenterOffset () {
      return this.xSize / 2 -
        (this.x(this.maxColumnIndex) - this.xRange[0]) / 2;
    },

    get xRange () {
      return [
        this.left + 60,
        this.right - 60
      ];
    },

    get xSize () {
      return this.xRange[1] - this.xRange[0];
    },

    get left () {
      return this.chart.width / 2;
    },

    get right () {
      return this.chart.width - 10;
    },

    get width () {
      return this.right - this.left;
    },

    get height () {
      return this.bottom - this.top;
    }
  };


  function LegendScale (chart) {
    this.chart = chart;
    this.x = d3.scale.linear();
    this.y = d3.scale.linear();
  }

  LegendScale.prototype = {
    update: function () {

      this.y
        .range([this.top, this.bottom])
        .domain([0, this.maxRows]);
    },

    itemY: function (index) {
      return this.y(index) +
        this.yCenterOffset;
    },

    get sortedTags () {
      var tagMap = {};
      var sortedData = this.chart.analysis.sortedData;

      return this.chart.analysis.sortedData.reduce(function (sortedTags, datum) {
        datum.tags.forEach(function (tag) {
          if (tag in tagMap) {
            return;
          }

          tagMap[tag] = true;
          sortedTags.push(tag);
        });

        return sortedTags;
      }.bind(this), []);
    },

    get tagColors () {
      return this.sortedTags.reduce(function (tagColors, tag, index) {
        tagColors[tag] = colors(index);
        return tagColors;
      }, {});
    },

    get yCenterOffset () {
      return this.ySize / 2 -
        (this.y(this.legendCount - 1) - this.top) / 2;
    },

    get ySize () {
      return this.bottom - this.top;
    },

    get legendCount () {
      return this.chart.data.length;
    },

    get maxWidth () {
      return 360;
    },

    get usableWidth () {
      return this.chart.width / 2 - this.rightMargin - this.leftMargin;
    },

    get collapse () {
      return this.usableWidth < this.maxWidth;
    },

    get maxRows () {
      if (this.chart.data.length < 7) {
        return 7;
      } else if (this.chart.data.length < 10) {
        return 10;
      } else if (this.chart.data.length < 20) {
        return 20;
      }
    },

    get leftMargin () {
      return 10;
    },

    get rightMargin () {
      return this.chart.width / 10;
    },

    get topMargin () {
      return 10;
    },

    get bottomMargin () {
      return 10;
    },

    get top () {
      return 10;
    },

    get bottom () {
      return this.chart.height - 10;
    },

    get left () {
      return this.collapse ?
        this.leftMargin :
        (this.leftMargin + (this.usableWidth / 2 - this.maxWidth / 2));
    },

    get right () {
      return this.usableWidth + 10;
    },

    get width () {
      return this.collapse ?
        (this.right - this.left) :
        this.maxWidth;
    },

    get height () {
      return this.bottom - this.top;
    }
  };


  function Comparison (analysis) {
    this.analysis = analysis;

    window.addEventListener('resize', this.update.bind(this));

    this.element = document.createElement('section');
    this.element.className = 'comparison-chart';

    this.dom = d3.select(document.createElement('div'))
      .classed('comparison-chart-dom', true);

    this.svg = d3.select(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    ).attr('width', '100%')
     .attr('height', '100%');

    this.element.appendChild(this.svg.node());
    this.element.appendChild(this.dom.node());

    this.components = [
      (this.legendScale = new LegendScale(this)),
      (this.columnScale = new ColumnScale(this)),
      new Baseline(this),
      new GuideLines(this),
      new Legend(this),
      new YAxis(this),
      new Columns(this)
    ];
  }

  Comparison.prototype = {
    get width () {
      if (!this.element.parentNode) {
        return 0;
      }

      return this.element.parentNode
        .getBoundingClientRect().width;
    },

    get height () {
      if (!this.element.parentNode) {
        return 0;
      }

      return this.element.parentNode
        .getBoundingClientRect().height;
    },

    get data () {
      return this.analysis.data;
    },

    update: function () {
      this.components.forEach(function (component) {
        component.update();
      });
    }
  };


  function Baseline (chart) {
    this.chart = chart;

    this.container = this.chart.svg
      .append('g')
      .classed('baseline-container', true);

    this.line = this.container
      .append('line')
      .classed('baseline-line', true);

    this.title = this.container
      .append('text')
      .classed('baseline-title', true);

    this.description = this.container
      .append('text')
      .classed('baseline-description', true);

    this.faster = this.container
      .append('text')
      .classed('baseline-faster', true)
      .text('faster');

    this.slower = this.container
      .append('text')
      .classed('baseline-slower', true)
      .text('slower');
  }

  Baseline.prototype = {
    update: function() {
      this.line
        .attr('x1', this.scale.left)
        .attr('x2', this.scale.right)
        .attr('y1', this.y)
        .attr('y2', this.y);

      this.title
        .attr('x', this.scale.left)
        .attr('y', this.scale.y(0))
        .text(this.titleText);

      this.description
        .attr('x', this.scale.left)
        .attr('y', this.scale.y(0))
        .text(this.descriptionText);

      this.faster
        .attr('x', this.scale.right)
        .attr('y', this.scale.y(0));

      this.slower
        .attr('x', this.scale.right)
        .attr('y', this.scale.y(0))
    },

    get scale () {
      return this.chart.columnScale;
    },

    get y () {
      return this.scale.height / 2 + this.scale.top;
    },

    get titleText () {
      switch (this.chart.analysis.baselineConfiguration) {
        case 'median':
          return 'Median';
        case null:
          if (this.chart.analysis.baselineDatum) {
            return 'Baseline';
          }
        default:
          return 'Mean';
      }
    },

    get descriptionText () {
      return this.chart.analysis.baseline.toFixed(2) + ' ms';
    }
  }


  function Legend (chart) {
    this.chart = chart;

    this.container = this.chart.dom
      .append('ul')
      .classed('legend-container', true);
  }

  Legend.prototype = {
    update: function() {
      var tagColors = this.scale.tagColors;

      this.container
        .style({
          width: this.scale.width + 'px',
          left: this.scale.left + 'px'
        });

      this.items = this.container
        .selectAll('li.legend-item')
        .data(this.chart.analysis.sortedData);

      var enteringItem = this.items
        .enter()
        .append('li')
        .classed('legend-item', true)

      enteringItem.append('span')
        .classed('legend-item-title', true);

      enteringItem.append('span')
        .classed('legend-item-tags', true);

      this.items
        .select('.legend-item-title')
        .text(function (datum) {
          return datum.name;
        });

      this.items
        .style({
          top: function (datum, index) {
            return this.scale.itemY(index) + 'px';
          }.bind(this),
          right: '0px'
        });

      this.tags = this.items
        .select('span.legend-item-tags')
        .selectAll('span.legend-item-tag')
        .data(function (datum) {
          return datum.tags;
        });

      this.tags
        .enter()
        .append('span')
        .classed('legend-item-tag', true);

      this.tags
        .text(function (tag) {
          //return '• ' + tag;
          return tag;
        })
        .style({
          color: function (tag, index) {
            return tagColors[tag](4);
          },
          background: function (tag, index) {
            return tagColors[tag](0);
          }
        })
    },

    get scale () {
      return this.chart.legendScale;
    }
  };


  function GuideLines (chart) {
    this.chart = chart;
    this.container = this.chart.svg
      .append('g')
      .classed('guide-lines-container', true);
  }

  GuideLines.prototype = {
    update: function() {
      this.lines = this.container
        .selectAll('path')
        .data(this.chart.analysis.sortedData);

      this.lines
        .enter()
        .append('path')
        .classed('guide-line', true);

      this.lines
        .attr('d', function (datum) {
          return this.pathGenerator(this.lineData(datum));
        }.bind(this));
    },

    lineData: function (datum) {
      return [
        datum,
        datum,
        datum,
        datum
      ];
    },

    get pathGenerator () {
      var chart = this.chart;

      return d3.svg.line()
        .x(function (datum, index) {
          switch (index) {
            case 0:
              return chart.legendScale.width +
                chart.legendScale.left + 6;
            case 1:
              return chart.legendScale.right +
                chart.legendScale.rightMargin / 2;
            case 2:
              return chart.columnScale.xRange[0];
            case 3:
              return chart.columnScale.yAxisLeft;
          }
        })
        .y(function (datum, index) {
          if (index > 1) {
            return chart.columnScale.y(
              chart.columnScale.relativeValue(datum)
            );
          }

          return chart.legendScale.y(
            chart.analysis.sortedData.indexOf(datum)
          ) + chart.legendScale.yCenterOffset;
        })
        .interpolate('monotone');
    }
  };

  function YAxis (chart) {
    this.chart = chart;

    this.container = this.chart.svg
      .append('g')
      .classed('y-axis-container', true);

    this.line = this.container
      .append('line')
      .classed('y-axis-line', true);
  }

  YAxis.prototype = {
    get scale () {
      return this.chart.columnScale;
    },

    update: function() {
      this.line
        .attr('x1', this.scale.yAxisLeft)
        .attr('x2', this.scale.yAxisLeft)
        .attr('y1', function (datum) {
          return this.scale.y.range()[0];
        }.bind(this))
        .attr('y2', function (datum) {
          return this.scale.y.range()[1];
        }.bind(this));

      this.labels = this.container
        .selectAll('text.y-axis-label')
        .data(this.scale.y.domain());

      this.labels
        .enter()
        .append('text')
        .classed('y-axis-label', true);

      this.labels
        .attr('x', this.scale.yAxisLeft)
        .attr('y', this.scale.y)
        .text(function (datum) {
          return datum.toFixed(2) + ' ms';
        });

      this.ticks = this.container
        .selectAll('text.y-axis-tick')
        .data(this.chart.analysis.sortedData);

      this.ticks
        .enter()
        .append('text')
        .classed('y-axis-tick', true);

      this.ticks
        .attr('x', this.tickLeft.bind(this))
        .attr('y', function (datum) {
          return this.scale.y(
            this.scale.relativeValue(datum)
          );
        }.bind(this))
        .text(this.tickText.bind(this));
    },

    tickText: function (datum) {
      var absoluteRatio = Math.abs(this.scale.relativeRatio(datum));

      if (absoluteRatio < 0.001) {
        return '';
      }

      return Math.floor(
        Math.abs(this.scale.relativeRatio(datum)) * 100
      ) + '%';
    },

    tickLeft: function (datum) {
      var sortedData = this.chart.analysis.sortedData;
      var nextDatum = sortedData[
        sortedData.indexOf(datum) + 1
      ];
      var nextRatio = nextDatum && this.scale.relativeRatio(nextDatum);

      if (nextRatio &&
          (nextRatio - this.scale.relativeRatio(datum)) < 0.1) {
        return this.scale.yAxisTicksLeft + 30;
      }

      return this.scale.yAxisTicksLeft;
    }
  };


  function Columns (chart) {
    this.chart = chart;

    this.container = this.chart.svg
      .append('g')
      .classed('columns-container', true);
  }

  Columns.prototype = {
    get scale () {
      return this.chart.columnScale;
    },

    update: function () {

      var groups = this.container
        .selectAll('g')
        .data(this.chart.analysis.groupedData);

      groups
        .enter()
        .append('g')
        .classed('column-group', true);

      groups
        .attr('transform', function(group) {
          return 'translate(' + this.scale.groupX(group) + ',0)';
        }.bind(this));

      var columns = groups
        .selectAll('rect')
        .data(function (group) {
          return group;
        });

      columns
        .enter()
        .append('rect');

      columns
        .attr('x', function (datum, index) {
          return this.scale.x(index);
        }.bind(this))
        .attr('y', function (datum, index) {
          return this.scale.y(
            Math.min(
              this.scale.relativeValue(datum),
              0
            )
          );
        }.bind(this))
        .attr('width', this.scale.columnWidth)
        .attr('height', function (datum, index) {
          return Math.abs(
            this.scale.y(
              this.scale.relativeValue(datum)
            ) - this.scale.y(0)
          );
        }.bind(this))
        .style({
          fill: function(datum, index, groupIndex) {
            return colors(groupIndex)(index);
          }
        });
    }
  };

  global.ComparisonChart = Comparison;
})(this);

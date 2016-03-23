/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
function ordinal(colors) {
  return d3.scale.ordinal().range(colors).domain(d3.range(colors.length));
}

var colors = d3.scale.ordinal().range([
  // Red
  ordinal([
    //'#b71c1c',
    '#c62828',
    //'#d32f2f',
    '#e53935',
    //'#f44336',
    '#ef5350',
    //'#e57373',
    '#ef9a9a',

    '#ffebee'
  ]),

  // Purple
  ordinal([
    //'#4a148c',
    '#6a1b9a',
    //'#7b1fa2',
    '#8e24aa',
    //'#9c27b0',
    '#ab47bc',
    //'#ba68c8',
    '#ce93d8',

    '#f3e5f5'
  ]),

  // Blue
  ordinal([
    //'#0d47a1',
    '#1565c0',
    //'#1976d2',
    '#1e88e5',
    //'#2196f3',
    '#42a5f5',
    //'#64b5f6',
    '#90caf9',

    '#e3f2fd'
  ]),

  // Cyan
  ordinal([
    //'#006064',
    '#00838f',
    //'#0097a7',
    '#00acc1',
    //'#00bcd4',
    '#26c6da',
    //'#4dd0e1',
    '#80deea',

    '#e0f7fa'
  ]),

  // Green
  ordinal([
    //'#1b5e20',
    '#2e7d32',
    //'#388e3c',
    '#43a047',
    //'#4caf50',
    '#66bb6a',
    //'#81c784',
    '#a5d6a7',

    '#e8f5e9'
  ]),

  // Orange
  ordinal([
    //'#e65100',
    '#ef6c00',
    //'#f57c00',
    '#fb8c00',
    //'#ff9800',
    '#ffa726',
    //'#ffb74d',
    '#ffcc80',

    '#fff3e0'
  ])
]);

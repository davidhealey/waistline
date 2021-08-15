# chartjs-plugin-annotation.js

An annotation plugin for Chart.js >= 2.4.0

This plugin draws lines and boxes on the chart area.

Annotations work with line, bar, scatter and bubble charts that use linear, logarithmic, time, or category scales. Annotations will not work on any chart that does not have exactly two axes, including pie, radar, and polar area charts.

![Example Screenshot from Dropbox](https://www.dropbox.com/s/92cmt8zrth55z55/Screenshot%202017-05-20%2018.26.39.png?dl=1)

[View this example on CodePen](https://codepen.io/compwright/full/mmQMrZ/)

## Configuration

To configure the annotations plugin, you can simply add new config options to your chart config.

```javascript
{
	annotation: {
		// Defines when the annotations are drawn.
		// This allows positioning of the annotation relative to the other
		// elements of the graph.
		//
		// Should be one of: afterDraw, afterDatasetsDraw, beforeDatasetsDraw
		// See http://www.chartjs.org/docs/#advanced-usage-creating-plugins
		drawTime: 'afterDatasetsDraw', // (default)

		// Mouse events to enable on each annotation.
		// Should be an array of one or more browser-supported mouse events
		// See https://developer.mozilla.org/en-US/docs/Web/Events
		events: ['click'],

		// Double-click speed in ms used to distinguish single-clicks from 
		// double-clicks whenever you need to capture both. When listening for
		// both click and dblclick, click events will be delayed by this
		// amount.
		dblClickSpeed: 350, // ms (default)

		// Array of annotation configuration objects
		// See below for detailed descriptions of the annotation options
		annotations: [{
			drawTime: 'afterDraw', // overrides annotation.drawTime if set
			id: 'a-line-1', // optional
			type: 'line',
			mode: 'horizontal',
			scaleID: 'y-axis-0',
			value: '25',
			borderColor: 'red',
			borderWidth: 2,

			// Fires when the user clicks this annotation on the chart
			// (be sure to enable the event in the events array below).
			onClick: function(e) {
				// `this` is bound to the annotation element
			}
		}]
	}
}
```

### Line Annotations
Vertical or horizontal lines are supported.

```javascript
{
	type: 'line',

	// optional drawTime to control layering, overrides global drawTime setting
	drawTime: 'afterDatasetsDraw',

	// optional annotation ID (must be unique)
	id: 'a-line-1',

	// set to 'vertical' to draw a vertical line
	mode: 'horizontal',

	// ID of the scale to bind onto
	scaleID: 'y-axis-0',

	// Data value to draw the line at
	value: 25,

	// Optional value at which the line draw should end
	endValue: 26,

	// Line color
	borderColor: 'red',

	// Line width
	borderWidth: 2,

	// Line dash
	// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
	borderDash: [2, 2],

	// Line Dash Offset
	// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
	borderDashOffset: 5,

	label: {
		// Background color of label, default below
		backgroundColor: 'rgba(0,0,0,0.8)',

		// Font family of text, inherits from global
		fontFamily: "sans-serif",

		// Font size of text, inherits from global
		fontSize: 12,

		// Font style of text, default below
		fontStyle: "bold",

		// Font color of text, default below
		fontColor: "#fff",

		// Padding of label to add left/right, default below
		xPadding: 6,

		// Padding of label to add top/bottom, default below
		yPadding: 6,

		// Radius of label rectangle, default below
		cornerRadius: 6,

		// Anchor position of label on line, can be one of: top, bottom, left, right, center. Default below.
		position: "center",

		// Adjustment along x-axis (left-right) of label relative to above number (can be negative)
		// For horizontal lines positioned left or right, negative values move
		// the label toward the edge, and positive values toward the center.
		xAdjust: 0,

		// Adjustment along y-axis (top-bottom) of label relative to above number (can be negative)
		// For vertical lines positioned top or bottom, negative values move
		// the label toward the edge, and positive values toward the center.
		yAdjust: 0,

		// Whether the label is enabled and should be displayed
		enabled: false,

		// Text to display in label - default is null
		content: "Test label"
	},

	// Mouse event handlers - be sure to enable the corresponding events in the
	// annotation events array or the event handler will not be called.
	// See https://developer.mozilla.org/en-US/docs/Web/Events for a list of
	// supported mouse events.
	onMouseenter: function(e) {},
	onMouseover: function(e) {},
	onMouseleave: function(e) {},
	onMouseout: function(e) {},
	onMousemove: function(e) {},
	onMousedown: function(e) {},
	onMouseup: function(e) {},
	onClick: function(e) {},
	onDblclick: function(e) {},
	onContextmenu: function(e) {},
	onWheel: function(e) {}
}
```

### Box Annotations
Box annotations are supported. If one of the axes is not specified, the box will take the entire chart dimension.

The 4 coordinates, xMin, xMax, yMin, yMax are optional. If not specified, the box is expanded out to the edges

```javascript
{
	type: 'box',

	// optional drawTime to control layering, overrides global drawTime setting
	drawTime: 'beforeDatasetsDraw',

	// optional annotation ID (must be unique)
	id: 'a-box-1',

	// ID of the X scale to bind onto
	xScaleID: 'x-axis-0',

	// ID of the Y scale to bind onto
	yScaleID: 'y-axis-0',

	// Left edge of the box. in units along the x axis
	xMin: 25,

	// Right edge of the box
	xMax: 40,

	// Top edge of the box in units along the y axis
	yMax: 20,

	// Bottom edge of the box
	yMin:  15,

	// Stroke color
	borderColor: 'red',

	// Stroke width
	borderWidth: 2,

	// Fill color
	backgroundColor: 'green',

	// Mouse event handlers - be sure to enable the corresponding events in the
	// annotation events array or the event handler will not be called.
	// See https://developer.mozilla.org/en-US/docs/Web/Events for a list of
	// supported mouse events.
	onMouseenter: function(e) {},
	onMouseover: function(e) {},
	onMouseleave: function(e) {},
	onMouseout: function(e) {},
	onMousemove: function(e) {},
	onMousedown: function(e) {},
	onMouseup: function(e) {},
	onClick: function(e) {},
	onDblclick: function(e) {},
	onContextmenu: function(e) {},
	onWheel: function(e) {}
}
```

## To-do Items

The following features still need to be done:

* Box annotation labels
* Point annotations
* Text annotations

## Installation

To download a zip, go to the Chart.Annotation.js on Github

To install via npm:

```bash
npm install chartjs-plugin-annotation --save
```

Prior to v0.2.0 this plugin was known as Chart.Annotation.js. You can still install this old version via NPM.

## Documentation

You can find documentation for Chart.js at [www.chartjs.org/docs](http://www.chartjs.org/docs).

## Contributing

Before submitting an issue or a pull request to the project, please take a moment to look over the [contributing guidelines](CONTRIBUTING.md) first.

## License

Chart.Annotation.js is available under the [MIT license](http://opensource.org/licenses/MIT).

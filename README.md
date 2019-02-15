Code sample
========================
This repository contains example code of a JavaScript project I worked on during November 2015. Please keep in mind that during the development, the client changed requirements and the overall concept multiple times, whilst also being unwilling to provide time to implement/refactor these changes properly. Thus forcing me, to make less desirable changes to the code.

ORIGINAL README: Tuinhuisjes 2D
========================

JavaScript code that uses [Snap.svg](http://snapsvg.io/) for creating two-dimensional vector drawings of summerhouses in modern browsers (Internet Explorer 9 and up, Safari, Chrome, Firefox and Opera).


Usage
--------------
1. Inside the header element, include the Snap.svg library before including the TuinhuisjesDrawer script.
    * `<script type="text/javascript" src="snap.svg-min.js"></script>`
    * `<script type="text/javascript" src="tuinhuisjesdrawer.js"></script>`
2. Add an SVGElement to the body that will be used as a container for the drawing, this SVGElement must have the attribute *preserveAspectRatio* with the value *xMidYMid meet*.
    * `<svg id="container" preserveAspectRatio="xMidYMid meet"></svg>`
3. Create a new instance of Tuinhuisje by supplying the identifier of the containing element and a Configuration Object (after the definition of the containing SVGElement, or more preferably: just before closing the the body element).
    * `new TuinhuisjesDrawer('container', configurationObject);`

API
--------------
### Redraw
```javascript
var THD = new TuinhuisjesDrawer('container', configurationObject);

THD.redraw(newConfigurationObject);
```

### Export
```javascript
var THD = new TuinhuisjesDrawer('container', configurationObject);

THD.export('json');
THD.export('svg');
```

Data
--------------
### Configuration Object
```javascript
Object {
    type: String ['quadrilateral' | 'pentagonal'],
    width: Number,
    depth: Number,
    walls: Array [Object Wall]
}
```

### Wall Object
```javascript
Object {
    String 'identifier': Object {
        overhang: Number,
        canopy: Object Canopy,
        doors: Array [Object Door],
        windows: Array [Object Window]
    }
}
```

### Canopy Object
```javascript
Object {
    depth: Number,
    sides: Array [Object CanopyType]
}
```

### CanopyType Object
```javascript
Object {
    {type: String [ 'OPEN' | 'CLOSED' | 'FENCE' | 'THIN_COLUMNS' | 'THICK_COLUMNS']}
}
```

### Door Object
```javascript
Object {
    indent: Number,
    width: Number,
    type: String ['sliding' | 'revolving'],
    rotation: String ['left' | 'right']
}
```

### Window Object
```javascript
Object {
    width: Number,
    indent: Number
}
```

### Constants
Use the internal constants to alter drawing specific behaviour:
```javascript
Constants = {
    SHAPE_PADDING: 50,
    SHAPE_FILL_COLOR: '#CFE2F3',
    SHAPE_OUTLINE_DASHARRAY: '10,5',
    SHAPE_OUTLINE_STROKE_WIDTH: 2,
    SHAPE_OUTLINE_STROKE_COLOR: '#000',
    THICKCOLUMN_SIZE: 30,
    THICKCOLUMN_LINE_SIZE: 1,
    THICKCOLUMN_LINE_COLOR: '#000',
    THICKCOLUMN_FILL_COLOR: '#000',
    THINCOLUMN_SIZE: 20,
    THINCOLUMN_LINE_SIZE: 1,
    THINCOLUMN_LINE_COLOR: '#000',
    THINCOLUMN_FILL_COLOR: '#000',
    DOWNSPOUT_DISTANCE: 2.5,
    DOWNSPOUT_INDENT: 5,
    DOWNSPOUT_BREADTH: 6,
    DOWNSPOUT_DEPTH: 8,
    DOWNSPOUT_COLOR: '#000',
    DOWNSPOUT_FILL: 'transparent',
    DOWNSPOUT_LINE_SIZE: 1,
    WALL_OPEN_LINE_COLOR: 'transparent',
    WALL_OPEN_LINE_SIZE: 0,
    WALL_COLUMN_LINE_COLOR: 'transparent',
    WALL_COLUMN_LINE_SIZE: 0,
    WALL_CLOSED_LINE_COLOR: '#000',
    WALL_CLOSED_LINE_SIZE: 5,
    WALL_FENCE_LINE_COLOR: '#000',
    WALL_FENCE_LINE_SIZE: 5,
    WALL_FENCE_DASHARRAY: '4,7.5',
    WALL_LINE_SIZE: 1.5,
    WALL_LINE_COLOR: '#000',
    WALL_LABEL_DISTANCE: 20,
    WALL_LABEL_SIZE: 16,
    WALL_LABEL_COLOR: '#000',
    DOOR_ANGLE: 22.5,
    DOOR_LINE_SIZE: 1.5,
    DOOR_LINE_COLOR: '#000',
    DOOR_ICON_DISTANCE: 5,
    DOOR_ICON_COLOR: '#000',
    DOOR_SLIDER_DISTANCE: 5,
    WINDOW_DEPTH: 10,
    WINDOW_LINE_SIZE: 1,
    WINDOW_LINE_COLOR: '#000',
    WINDOW_FILL_COLOR: '#CFE2F3',
    PENTAGONAL_WALL_CORRECTION_LENGTH: 75
}
```


Examples
--------------
### A minimal configuration for drawing a four-sided summerhouse:
```javascript
new TuinhuisjesDrawer('container', {
    type: 'quadrilateral',
    width: 600,
    depth: 900,
    roof: {
        type: 'flat',
    },
    walls: {
        'A': {overhang: 20},
        'B': {overhang: 20},
        'C': {overhang: 20},
        'D': {overhang: 20}
    }
});
```

### An implementation of a fully configured five-sided summerhouse with canopy, overhang, sliding and revolving doors, downspout and windows:
```javascript
new TuinhuisjesDrawer('container', {
    type: 'pentagonal',
    width: 400,
    depth: 500,
    roof: {
        type: 'hipped',
        gabletype: 'side'
    },
    downspout: ['B', 'A'],
    walls: {
        'A': {
            overhang: false,
            canopy: {
                depth: 120,
                sides: [
                    {type: 'CLOSED'},
                    {type: 'THICK_COLUMNS'},
                    {type: 'FENCE'}
                ]
            },
            doors: false,
            windows: [
                {width: 305, indent: 10}
            ]
        },
        'B': {
            overhang: 31,
            canopy: false,
            doors: [
                {rotation: 'left', indent: 10, length: 50, type: 'revolving'},
                {rotation: 'right', indent: 60, length: 50, type: 'revolving'}
            ],
            windows: [
                {width: 150, indent: 120}
            ]
        },
        'C': {
            overhang: false,
            canopy: {
                depth: 70,
                sides: [
                    {type: 'CLOSED'},
                    {type: 'THICK_COLUMNS'},
                    {type: 'OPEN'}
                ]
            },
            doors: false,
            windows: [
                {width: 130, indent: 10},
                {width: 240, indent: 150},
            ]
        },
        'D': {
            overhang: false,
            canopy: {
                depth: 90,
                sides: [
                    {type: 'THIN_COLUMNS'},
                    {type: 'THICK_COLUMNS'},
                    {type: 'THIN_COLUMNS'}
                ]
            },
            doors: [
                {rotation: 'left', indent: 115, length: 50, type: 'sliding'},
                {rotation: 'left', indent: 10, length: 50, type: 'revolving'}
            ],
            windows: [
                {width: 230, indent: 180},
            ]
        },
        'E': {
            overhang: 10,
            canopy: false,
            doors: [
                {rotation: 'left', indent: 0, length: 50, type: 'revolving'},
                {rotation: 'right', indent: 55, length: 50, type: 'revolving'}
            ],
            windows: false
        }
    }
});
```
/* global Snap */

var TuinhuisjesDrawer = (function (parent, snap, undefined) {
    /* Private variables */
    var Constants = {
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
        },
        Utilities = {
            getVectorByVectorLengthAndAngle: function (vector, length, angle) {
                return new Vector(vector.x + length * Math.sin(snap.rad(angle)), vector.y + length * Math.cos(snap.rad(angle)));
            },
            getAngleBetweenVectors: function (v1, v2) {
                return snap.deg(Math.atan2((v2.x - v1.x), (v2.y - v1.y)));
            },
            getDistanceBetweenVectors: function (v1, v2) {
                return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
            },
            defaultArgument: function (argument, defaultvalue) {
                return (typeof argument === 'undefined' ? defaultvalue : argument);
            },
            getHypotenuseLength: function (a, b) {
                return Math.sqrt(a * a + b * b);
            },
            rotateArray: function (array, reverseRotate) {
                return reverseRotate ? array.unshift(array.pop()) : array.push(array.shift());
            }
        }, Vector = function (x, y) {
            this.x = x;
            this.y = y;

            this.toObject = function () {
                return {'x': this.x, 'y': this.y};
            };

            return this;
        };


    /* Constructor */
    function TuinhuisjesDrawer() {
        return Tuinhuisje;
    }

    /* Public functions */
    TuinhuisjesDrawer.version = "0.0.3";
    TuinhuisjesDrawer.toString = function () {
        return "TuinhuisjesDrawer v" + this.version;
    };

    function Tuinhuisje(containerIdentifier, attributes) {
        /* Private variables */
        var Summerhouse = attributes, paper, drawingAttributes = {};

        setLastLabelValueBySummerhouseType();

        /* Check if the element that is ought to be functioning as a container can be found */
        if (!document.getElementById(containerIdentifier)) {
            throw new Error('Element with id ' + containerIdentifier + ' could not be found, did execute this function after the DOM was ready?');
        }

        /* Initialize the Snap library */
        paper = snap('#' + containerIdentifier);

        /* Create an arrow marker that can be used as line-ending */
        drawingAttributes.arrowMarker = paper.path('M 0 0 l 0 5 l 2.5 -2.5 l -2.5 -2.5 z').attr({fill: Constants.DOOR_ICON_COLOR}).marker(0, 0, 5, 5, 2, 2.5);

        /* Private functions */
        function drawSummerhouse() {
            var summerhouse = paper.group();

            /* Draw the background of the shape (roof) and add it to the summerhouse group */
            summerhouse.add(drawRoof());

            /* Draw the walls (which contain their own attributes that will be drawn e.g. windows, doors, canopy.) */
            summerhouse.add(drawWalls());

            summerhouse.add(drawCanopy());

            summerhouse.add(drawRoofDetails());

            return summerhouse;
        }

        function setLastLabelValueBySummerhouseType() {
            Summerhouse.lastLabel = (Summerhouse.type === 'pentagonal') ? 'E' : 'D';
        }

        function calculateSummerhouseValues() {
            var dimensions = getShapeDimensions(), width = Summerhouse.width, depth = Summerhouse.depth,
                x = dimensions.width - getTotalOverhangDepthByWall(Summerhouse.walls.D),
                y = dimensions.height - getTotalOverhangDepthByWall(Summerhouse.walls.A);

            /* Hardcoded wall values per type, could improve and/or iterate over number of walls */
            switch (Summerhouse.type) {
                case 'quadrilateral':
                default:
                    Summerhouse.walls.A.calculated = {
                        name: 'A',
                        begin: new Vector(x, y),
                        end: new Vector(x - width, y)
                    };
                    Summerhouse.walls.B.calculated = {
                        name: 'B',
                        begin: new Vector(x - width, y),
                        end: new Vector(x - width, y - depth)
                    };
                    Summerhouse.walls.C.calculated = {
                        name: 'C',
                        begin: new Vector(x - width, y - depth),
                        end: new Vector(x, y - depth)
                    };
                    Summerhouse.walls.D.calculated = {
                        name: 'D',
                        begin: new Vector(x, y - depth),
                        end: new Vector(x, y)
                    };
                    break;
                case 'pentagonal':
                    Summerhouse.walls.A.calculated = {
                        name: 'A',
                        begin: new Vector(x - Constants.PENTAGONAL_WALL_CORRECTION_LENGTH, y),
                        end: new Vector(x - width, y)
                    };
                    Summerhouse.walls.B.calculated = {
                        name: 'B',
                        begin: new Vector(x - width, y),
                        end: new Vector(x - width, y - depth)
                    };
                    Summerhouse.walls.C.calculated = {
                        name: 'C',
                        begin: new Vector(x - width, y - depth),
                        end: new Vector(x, y - depth)
                    };
                    Summerhouse.walls.D.calculated = {
                        name: 'D',
                        begin: new Vector(x, y - depth),
                        end: new Vector(x, y - Constants.PENTAGONAL_WALL_CORRECTION_LENGTH)
                    };
                    Summerhouse.walls.E.calculated = {
                        name: 'E',
                        begin: new Vector(x, y - Constants.PENTAGONAL_WALL_CORRECTION_LENGTH),
                        end: new Vector(x - Constants.PENTAGONAL_WALL_CORRECTION_LENGTH, y)
                    };
                    break;
            }
        }

        function drawWalls() {
            var walls = paper.group(), key;

            for (key in Summerhouse.walls) {
                if (Summerhouse.walls.hasOwnProperty(key)) {
                    walls.add(drawWall(Summerhouse.walls[key]));
                }
            }

            return walls;
        }

        function drawRoof() {
            return paper.group(drawRoofBackground());
        }

        function drawRoofBackground() {
            var pathString = getRoofBackgroundPath();

            return paper.path(pathString).attr({
                'fill': Constants.SHAPE_FILL_COLOR,
                'stroke-dasharray': Constants.SHAPE_OUTLINE_DASHARRAY,
                'stroke-width': Constants.SHAPE_OUTLINE_STROKE_WIDTH,
                'stroke': Constants.SHAPE_OUTLINE_STROKE_COLOR
            });
        }

        function drawRoofDetails() {
            var roofDetails = paper.group(), roofVectors = getRoofVectors();

            switch (Summerhouse.roof.type) {
                case 'gable':
                    var lineStart, lineEnd,
                        lengthA = Utilities.getDistanceBetweenVectors(roofVectors[0], roofVectors[1]),
                        lengthB = Utilities.getDistanceBetweenVectors(roofVectors[1], roofVectors[2]);

                    if (Summerhouse.roof.gabletype === 'front') {
                        lineStart = Utilities.getVectorByVectorLengthAndAngle(roofVectors[0], lengthA * 0.5, Utilities.getAngleBetweenVectors(roofVectors[0], roofVectors[1]));
                        lineEnd = Utilities.getVectorByVectorLengthAndAngle(lineStart, lengthB, Utilities.getAngleBetweenVectors(roofVectors[1], roofVectors[2]));
                    } else {
                        lineStart = Utilities.getVectorByVectorLengthAndAngle(roofVectors[1], lengthB * 0.5, Utilities.getAngleBetweenVectors(roofVectors[1], roofVectors[2]));
                        lineEnd = Utilities.getVectorByVectorLengthAndAngle(lineStart, lengthA, Utilities.getAngleBetweenVectors(roofVectors[1], roofVectors[0]));
                    }
                    roofDetails.add(drawLineBetweenVectors(lineStart, lineEnd));
                    break;
                case 'hipped':
                    var lengthY = Utilities.getDistanceBetweenVectors(roofVectors[1], roofVectors[2]),
                        lengthX = Utilities.getDistanceBetweenVectors(roofVectors[2], roofVectors[3]);
                    if (lengthY !== lengthX) {
                        var isPortraitView = (lengthY > lengthX) ? true : false,
                            centerLength = isPortraitView ? lengthX - lengthY : lengthY - lengthX,
                            cathetusLength = isPortraitView ? lengthX * 0.5 : lengthY * 0.5,
                            hypotenuseLength = Utilities.getHypotenuseLength(cathetusLength, cathetusLength),
                            angle,
                            centerVector1,
                            centerVector2;

                        //If the summerhouse dimensions aren't portrait (i.e. lengthY > lengthX), do a reverse rotate the array of vectors to ensure drawing starts at the correct side.
                        if (!isPortraitView) {
                            Utilities.rotateArray(roofVectors, true);
                        }

                        angle = Utilities.getAngleBetweenVectors(roofVectors[0], roofVectors[1]);
                        centerVector1 = Utilities.getVectorByVectorLengthAndAngle(roofVectors[0], hypotenuseLength, angle - 45);
                        centerVector2 = Utilities.getVectorByVectorLengthAndAngle(centerVector1, centerLength, angle + 90);

                        roofDetails.add(drawLineBetweenVectors(roofVectors[0], centerVector1));
                        roofDetails.add(drawLineBetweenVectors(roofVectors[1], centerVector1));
                        roofDetails.add(drawLineBetweenVectors(centerVector1, centerVector2));
                        roofDetails.add(drawLineBetweenVectors(centerVector2, roofVectors[2]));
                        roofDetails.add(drawLineBetweenVectors(centerVector2, roofVectors[3]));
                    } else {
                        roofDetails.add(drawLineBetweenVectors(roofVectors[0], roofVectors[2]));
                        roofDetails.add(drawLineBetweenVectors(roofVectors[1], roofVectors[3]));
                    }
                    break;
                case 'flat':
                default:
                    //Flat roofs don't have any details so do nothing, only used as a safeguard.
                    break;
            }

            return roofDetails.attr({
                'fill': Constants.SHAPE_FILL_COLOR,
                'stroke-dasharray': Constants.SHAPE_OUTLINE_DASHARRAY,
                'stroke-width': Constants.SHAPE_OUTLINE_STROKE_WIDTH,
                'stroke': Constants.SHAPE_OUTLINE_STROKE_COLOR
            });
        }

        function getRoofBackgroundPath() {
            var i, vectors = getRoofVectors(), vector, path = snap.format("M{x} {y}", vectors[0]);

            for (i = 0; i < vectors.length; i++) {
                vector = (i < vectors.length) ? vectors[i] : vectors[0];
                path += ' L ' + vector.x + ' ' + vector.y;
            }

            path += ' Z';

            return path;
        }

        function getRoofVectors() {
            var dimensions = getShapeDimensions(), vectors = [], canopyCorrection;

            if (Summerhouse.roof.type === 'flat' && Summerhouse.type === 'pentagonal') {
                //Calculate canopyCorrection, when wall D has a canopy wall E shouldn't have overhang.
                canopyCorrection = !Summerhouse.walls.D.canopy && !Summerhouse.walls.A.canopy ? Constants.PENTAGONAL_WALL_CORRECTION_LENGTH : 0;

                vectors.push(new Vector(dimensions.width - canopyCorrection, dimensions.height));
                vectors.push(new Vector(0, dimensions.height));
                vectors.push(new Vector(0, 0));
                vectors.push(new Vector(dimensions.width, 0));
                vectors.push(new Vector(dimensions.width, dimensions.height - canopyCorrection));
            } else {
                vectors.push(new Vector(dimensions.width, dimensions.height));
                vectors.push(new Vector(0, dimensions.height));
                vectors.push(new Vector(0, 0));
                vectors.push(new Vector(dimensions.width, 0));
            }

            return vectors;
        }

        function drawWall(wall) {
            var key, wallGroup = paper.group(), angle, angleAdjustment, widthAdjustment;

            wallGroup.add(drawLineBetweenVectors(wall.calculated.begin, wall.calculated.end).attr({
                stroke: Constants.WALL_LINE_COLOR,
                strokeWidth: Constants.WALL_LINE_SIZE,
                strokeLinecap: 'round'
            }));
            wallGroup.add(drawWallLabel(wall.calculated.begin, wall.calculated.end, wall.calculated.name));

            if (wall) {
                if (wall.windows) {
                    for (key in wall.windows) {
                        if (wall.windows.hasOwnProperty(key)) {
                            var window = wall.windows[key];
                            wallGroup.add(drawWindow(wall.calculated.begin, wall.calculated.end, window.indent, window.width));
                        }
                    }
                }

                if (wall.doors) {
                    for (key in wall.doors) {
                        if (wall.doors.hasOwnProperty(key)) {
                            var door = wall.doors[key];
                            wallGroup.add(drawDoor(wall.calculated.begin, wall.calculated.end, parseInt(door.indent), parseInt(door.length), door.type, door.rotation));
                        }
                    }
                }
            }

            /* Check if the downspout ought to be placed on this wall */
            if (Summerhouse.downspout && Summerhouse.downspout[0] === wall.calculated.name) {
                /* Get the downspout position, this can only be begin or end */
                if (getDownspoutPosition() === 'begin') {
                    angle = Utilities.getAngleBetweenVectors(wall.calculated.begin, wall.calculated.end);
                    widthAdjustment = (Math.abs(angle) !== 90) ? Constants.DOWNSPOUT_BREADTH : Constants.DOWNSPOUT_DEPTH;
                    angleAdjustment = (getTotalOverhangDepthByWall(wall) > (Constants.DOWNSPOUT_DISTANCE + (widthAdjustment * 0.5))) ? 90 : -90;
                    drawDownspout(Utilities.getVectorByVectorLengthAndAngle(wall.calculated.begin, Constants.DOWNSPOUT_DISTANCE + widthAdjustment, angle + angleAdjustment), angle);
                } else {
                    angle = Utilities.getAngleBetweenVectors(wall.calculated.end, wall.calculated.begin);
                    widthAdjustment = (Math.abs(angle) !== 90) ? Constants.DOWNSPOUT_BREADTH : Constants.DOWNSPOUT_DEPTH;
                    angleAdjustment = (getTotalOverhangDepthByWall(wall) > (Constants.DOWNSPOUT_DISTANCE + (widthAdjustment * 0.5))) ? 90 : -90;
                    drawDownspout(Utilities.getVectorByVectorLengthAndAngle(wall.calculated.end, Constants.DOWNSPOUT_DISTANCE + widthAdjustment, angle - angleAdjustment), angle);
                }
            }

            return wallGroup;
        }

        function getTotalOverhangDepthByWall(wall) {
            if (wall.canopy) {
                return wall.canopy.depth + wall.overhang;
            } else {
                return wall.overhang
            }
        }

        function hasFullyChainedCanopy() {
            var key;

            for (key in Summerhouse.walls) {
                if (Summerhouse.walls.hasOwnProperty(key)) {
                    // Hardcoded check due to specific behaviour of wall E, ought to consider better separation of concerns
                    if (key !== 'E' && !Summerhouse.walls[key].canopy) {
                        return false;
                    }
                }
            }

            return true;
        }

        function getNextWallByDrawingOrder(wall) {
            var keys = Object.keys(Summerhouse.walls), location = keys.indexOf(wall.calculated.name);

            Utilities.rotateArray(keys);

            return Summerhouse.walls[keys[location]];
        }

        function getPreviousWallByDrawingOrder(wall) {
            var keys = Object.keys(Summerhouse.walls), location = keys.indexOf(wall.calculated.name);

            Utilities.rotateArray(keys, true);

            return Summerhouse.walls[keys[location]];
        }

        //Recursive function that will return a list with connected walls that contain canopy
        function getChainedWallsWithCanopyByWall(wall, orientation, wallList) {
            var adjacentWalls = getAdjacentWallsByWall(wall), nextWall = adjacentWalls[0],
                previousWall = adjacentWalls[1], list = Utilities.defaultArgument(wallList, []);

            if (wall.canopy && list.indexOf(wall) === -1) {
                (orientation === 'left') ? list.unshift(wall) : list.push(wall);

                if (nextWall && list.indexOf(nextWall) === -1) {
                    getChainedWallsWithCanopyByWall(nextWall, 'left', list);
                }

                if (previousWall && list.indexOf(previousWall) === -1) {
                    getChainedWallsWithCanopyByWall(previousWall, 'right', list);
                }
            }

            return list;
        }

        //Hardcoded adjacent walls to suit special logic for wall E (which can't have a canopy)
        function getAdjacentWallsByWall(wall) {
            switch (wall.calculated.name) {
                case 'A':
                    return [Summerhouse.walls.D, Summerhouse.walls.B];
                case 'B':
                    return [Summerhouse.walls.A, Summerhouse.walls.C];
                case 'C':
                    return [Summerhouse.walls.B, Summerhouse.walls.D];
                case 'D':
                    return [Summerhouse.walls.C, Summerhouse.walls.A];
                case 'E':
                    return [Summerhouse.walls.D, Summerhouse.walls.A];
                default:
                    return false;
            }
        }

        function getDownspoutPosition() {
            var keys = Object.keys(Summerhouse.walls), firstWallName = keys[0], lastWallName = keys[keys.length - 1];

            if (Summerhouse.downspout[0] === lastWallName && Summerhouse.downspout[1] === firstWallName) {
                return 'end';
            } else if (Summerhouse.downspout[0] === firstWallName && Summerhouse.downspout[1] === lastWallName) {
                return 'begin';
            } else {
                return Summerhouse.downspout[0] > Summerhouse.downspout[1] ? 'begin' : 'end';
            }
        }

        function drawDownspout(vector, angle) {
            var width = (Math.abs(angle) === 90) ? Constants.DOWNSPOUT_BREADTH : Constants.DOWNSPOUT_DEPTH,
                distance = (angle > 180) ? -width + Constants.DOWNSPOUT_INDENT : width + Constants.DOWNSPOUT_INDENT,
                adjustedVector = Utilities.getVectorByVectorLengthAndAngle(vector, distance, angle);

            paper.ellipse(adjustedVector.x, adjustedVector.y, Constants.DOWNSPOUT_BREADTH, Constants.DOWNSPOUT_DEPTH).attr({
                'fill': Constants.DOWNSPOUT_FILL,
                'stroke': Constants.DOWNSPOUT_COLOR,
                'strokeWidth': Constants.DOWNSPOUT_LINE_SIZE
            });
        }

        function drawWindow(wallStart, wallEnd, windowOffset, windowWidth) {
            var angle = Utilities.getAngleBetweenVectors(wallEnd, wallStart),
                c = Utilities.getVectorByVectorLengthAndAngle(wallEnd, windowOffset, angle),
                e = Utilities.getVectorByVectorLengthAndAngle(c, Constants.WINDOW_DEPTH * 0.5, angle - 90),
                f = Utilities.getVectorByVectorLengthAndAngle(e, Constants.WINDOW_DEPTH, angle - 270),
                g = Utilities.getVectorByVectorLengthAndAngle(f, windowWidth, angle),
                h = Utilities.getVectorByVectorLengthAndAngle(g, Constants.WINDOW_DEPTH, angle - 90);

            return paper.path(Snap.format('M{e.x},{e.y} L{f.x},{f.y} L{g.x},{g.y} L{h.x},{h.y} Z', {
                e: e,
                f: f,
                g: g,
                h: h
            })).attr({
                fill: Constants.WINDOW_FILL_COLOR,
                stroke: Constants.WINDOW_LINE_COLOR,
                strokeWidth: Constants.WINDOW_LINE_SIZE,
                strokeLinecap: "round"
            });

            /*
             return paper.group(
             drawLineBetweenVectors(e, f),
             drawLineBetweenVectors(f, g),
             drawLineBetweenVectors(g, h),
             drawLineBetweenVectors(h, e)
             ).attr({stroke: Constants.WINDOW_LINE_COLOR, strokeWidth: Constants.WINDOW_LINE_SIZE, strokeLinecap: "round"});
             */
        }

        function CanopyWall(begin, end, type, label) {
            this.begin = begin;
            this.end = end;
            this.type = type;
            this.label = label || null;

            this.setLabel = function (label) {
                this.label = label;
            };

            return this;
        }

        function drawCanopy() {
            var i, canopyGroup = paper.group(), dimensions;

            if (hasFullyChainedCanopy()) {
                dimensions = getFullyChainedCanopyDimensions();
            } else {
                dimensions = getChainedCanopyDimensions();
            }

            for (i = 0; i < dimensions.length; i++) {
                canopyGroup.add(drawCanopyWalls(dimensions[i]));
            }

            return canopyGroup;
        }

        function calculateCanopyWalls() {
            var wallGroup = [], key, i;

            for (key in Summerhouse.walls) {
                if (Summerhouse.walls.hasOwnProperty(key) && Summerhouse.walls[key].canopy) {
                    var c = true;

                    for (i = 0; i < wallGroup.length; i++) {
                        if (wallGroup[i].indexOf(Summerhouse.walls[key]) !== -1) {
                            c = false;
                            break;
                        }
                    }

                    if (c) {
                        wallGroup.push(getChainedWallsWithCanopyByWall(Summerhouse.walls[key]));
                    }
                }
            }

            return wallGroup;
        }

        function getNextWallLabel() {
            var nextLetter = String.fromCharCode(Summerhouse.lastLabel.charCodeAt(0) + 1);
            Summerhouse.lastLabel = nextLetter;

            return Summerhouse.lastLabel;
        }

        function drawCanopyWalls(wallGroup) {
            var i, canopyWall, canopyGroup = paper.group(), columnGroup = paper.group();

            for (i = 0; i < wallGroup.length; i++) {
                canopyWall = wallGroup[i];
                canopyGroup.add(drawCanopyWall(canopyWall));
                if (i > 0 && canopyWallTypeHasColumns(canopyWall)) {
                    if (canopyWallTypeHasColumns(wallGroup[i - 1])) {
                        columnGroup.add(drawCanopyColumnAtEndOfWall(wallGroup[i - 1]));
                        //Adjacent walls have columns, draw columns on corners.
                    }
                } else if (i === 0 && hasFullyChainedCanopy()) {
                    //If fully chained canopy first wall should check with last wall.
                    if (canopyWallTypeHasColumns(wallGroup[wallGroup.length - 1])) {
                        columnGroup.add(drawCanopyColumnAtEndOfWall(wallGroup[wallGroup.length - 1]));
                    }
                }
            }

            canopyGroup.add(columnGroup);
            return canopyGroup;
        }

        function drawCanopyColumnAtEndOfWall(wall) {
            var column = paper.group(),
                columnSize = (wall.type === 'THICK_COLUMNS') ? Constants.THICKCOLUMN_SIZE : Constants.THINCOLUMN_SIZE,
                startAngle = Utilities.getAngleBetweenVectors(wall.begin, wall.end),
                c1 = Utilities.getVectorByVectorLengthAndAngle(wall.end, columnSize, startAngle - 90),
                c2 = Utilities.getVectorByVectorLengthAndAngle(c1, columnSize, startAngle - 180),
                c3 = Utilities.getVectorByVectorLengthAndAngle(c2, columnSize, startAngle - 270);

            column.add(drawLineBetweenVectors(wall.end, c1));
            column.add(drawLineBetweenVectors(c1, c2));
            column.add(drawLineBetweenVectors(c2, c3));
            column.add(drawLineBetweenVectors(c3, wall.end));

            return column.attr(getColumnAttributes(wall.type));
        }

        function getColumnAttributes(wallType) {
            var attributes;

            switch (wallType) {
                case 'THIN_COLUMNS':
                default:
                    attributes = {
                        'fill': Constants.THINCOLUMN_FILL_COLOR,
                        'stroke-width': Constants.THINCOLUMN_LINE_SIZE,
                        'stroke': Constants.THINCOLUMN_LINE_COLOR
                    };
                    break;
                case 'THICK_COLUMNS':
                    attributes = {
                        'fill': Constants.THICKCOLUMN_FILL_COLOR,
                        'stroke-width': Constants.THICKCOLUMN_LINE_SIZE,
                        'stroke': Constants.THICKCOLUMN_LINE_COLOR
                    };
                    break;
            }

            return attributes;
        }

        function canopyWallTypeHasColumns(canopyWall) {
            return (canopyWall.type === 'THICK_COLUMNS' || canopyWall.type === 'THIN_COLUMNS');
        }

        function drawCanopyWall(canopyWall) {
            var canopyWallAttributes = getWallAttributesByType(canopyWall.type);

            drawWallLabel(canopyWall.begin, canopyWall.end, canopyWall.label);

            return drawLineBetweenVectors(canopyWall.begin, canopyWall.end).attr(canopyWallAttributes);
        }

        function getWallAttributesByType(type) {
            switch (type) {
                default:
                case 'OPEN':
                    return {stroke: Constants.WALL_OPEN_LINE_COLOR, strokeWidth: Constants.WALL_OPEN_LINE_SIZE};
                case 'CLOSED':
                    return {stroke: Constants.WALL_CLOSED_LINE_COLOR, strokeWidth: Constants.WALL_CLOSED_LINE_SIZE};
                case 'FENCE':
                    return {
                        stroke: Constants.WALL_FENCE_LINE_COLOR,
                        strokeWidth: Constants.WALL_FENCE_LINE_SIZE,
                        'stroke-dasharray': Constants.WALL_FENCE_DASHARRAY
                    };
                case 'THIN_COLUMNS':
                case 'THICK_COLUMNS':
                    return {stroke: Constants.WALL_COLUMN_LINE_COLOR, strokeWidth: Constants.WALL_COLUMN_LINE_SIZE};
            }
        }

        /**
         *
         * @returns {Array}
         */
        function getFullyChainedCanopyDimensions() {
            var dimensions = getShapeDimensions();

            return [[
                new CanopyWall(new Vector(dimensions.width, dimensions.height), new Vector(0, dimensions.height), Summerhouse.walls.A.canopy.sides[1].type, getNextWallLabel()),
                new CanopyWall(new Vector(0, dimensions.height), new Vector(0, 0), Summerhouse.walls.B.canopy.sides[1].type, getNextWallLabel()),
                new CanopyWall(new Vector(0, 0), new Vector(dimensions.width, 0), Summerhouse.walls.C.canopy.sides[1].type, getNextWallLabel()),
                new CanopyWall(new Vector(dimensions.width, 0), new Vector(dimensions.width, dimensions.height), Summerhouse.walls.D.canopy.sides[1].type, getNextWallLabel())
            ]];
        }

        function getChainedCanopyDimensions() {
            var i, j, canopyWallGroups = [], canopyWallGroup, wallGroups = calculateCanopyWalls();

            // Loop through the different groups of walls, there can be a maximum of 2 groups at the moment (because of a maximum of 4 walls).
            for (i = 0; i < wallGroups.length; i++) {
                var canopyWallGroup = [];

                if (wallGroups[i].length === 1) {
                    // If wall group isn't a chained one (i.e. a single wall), just draw a single 3-sided canopy on that wall.
                    canopyWallGroups.push(getSingleCanopyDimensions(wallGroups[i][0]));
                } else {
                    // Loop through the different walls in the wallgroup
                    for (j = 0; j < wallGroups[i].length; j++) {
                        var wall = wallGroups[i][j],
                            angle = Utilities.getAngleBetweenVectors(wall.calculated.begin, wall.calculated.end),
                            sideLength = getCanopyLengthByWall(wall),
                            sideAddition = (j + 1 < wallGroups[i].length) ? wallGroups[i][j + 1].canopy.depth : 0,
                            v1 = Utilities.getVectorByVectorLengthAndAngle(wall.calculated.begin, wall.canopy.depth, angle + 90),
                            v2 = Utilities.getVectorByVectorLengthAndAngle(v1, sideLength + sideAddition, angle);

                        //First part logic
                        if (j === 0) {
                            canopyWallGroup.push(new CanopyWall(wall.calculated.begin, v1, wall.canopy.sides[0].type, getNextWallLabel()));
                        }

                        //Chain normal parts to previous ending
                        v1 = canopyWallGroup[canopyWallGroup.length - 1].end;
                        canopyWallGroup.push(new CanopyWall(v1, v2, wall.canopy.sides[1].type, getNextWallLabel()));

                        //Last part logic
                        if (j === wallGroups[i].length - 1) {
                            canopyWallGroup.push(new CanopyWall(v2, wall.calculated.end, wall.canopy.sides[2].type, getNextWallLabel()));
                        }
                    }
                    canopyWallGroups.push(canopyWallGroup);
                }
            }

            return canopyWallGroups;
        }

        function getCanopyLengthByWall(wall) {
            if (Summerhouse.type === 'pentagonal' && (wall.calculated.name === 'D')) {
                return Utilities.getDistanceBetweenVectors(wall.calculated.begin, wall.calculated.end) + 75;
            } else {
                return Utilities.getDistanceBetweenVectors(wall.calculated.begin, wall.calculated.end);
            }
        }

        function getSingleCanopyDimensions(wall) {
            var angle = Utilities.getAngleBetweenVectors(wall.calculated.begin, wall.calculated.end),
                canopyLength = getCanopyLengthByWall(wall),
                v1 = Utilities.getVectorByVectorLengthAndAngle(wall.calculated.begin, wall.canopy.depth, angle + 90),
                v2 = Utilities.getVectorByVectorLengthAndAngle(v1, canopyLength, angle);

            return [
                new CanopyWall(wall.calculated.begin, v1, wall.canopy.sides[0].type, getNextWallLabel()),
                new CanopyWall(v1, v2, wall.canopy.sides[1].type, getNextWallLabel()),
                new CanopyWall(v2, wall.calculated.end, wall.canopy.sides[2].type, getNextWallLabel())
            ];
        }

        function drawLineBetweenVectors(vector1, vector2) {
            return paper.path(snap.format("M{x1} {y1} L {x2} {y2}", {
                x1: vector1.x,
                y1: vector1.y,
                x2: vector2.x,
                y2: vector2.y
            }));
        }

        function drawWallLabel(wallStart, wallEnd, labelText) {
            var angle = Utilities.getAngleBetweenVectors(wallStart, wallEnd),
                d = Utilities.getDistanceBetweenVectors(wallStart, wallEnd),
                c = Utilities.getVectorByVectorLengthAndAngle(wallStart, d * 0.5, angle),
                e = Utilities.getVectorByVectorLengthAndAngle(c, Constants.WALL_LABEL_DISTANCE, angle - 90);

            return paper.text(e.x, e.y, labelText).attr({
                textAnchor: 'middle',
                'dominant-baseline': 'middle',
                'font-weight': 'bold',
                'font-family': 'Arial',
                'fill': Constants.WALL_LABEL_COLOR,
                'font-size': Constants.WALL_LABEL_SIZE
            });
        }

        function drawDoor(wallStart, wallEnd, doorIndent, doorLength, doorType, doorRotation) {
            var doorStart, doorEnd, angle = Utilities.getAngleBetweenVectors(wallEnd, wallStart), doorAttributes = {};

            if (doorType === 'revolving') {
                if (doorRotation === 'right') {
                    doorStart = Utilities.getVectorByVectorLengthAndAngle(wallEnd, doorIndent + doorLength, angle);
                    doorEnd = Utilities.getVectorByVectorLengthAndAngle(doorStart, doorLength, angle - (180 - Constants.DOOR_ANGLE));
                } else {
                    doorStart = Utilities.getVectorByVectorLengthAndAngle(wallEnd, doorIndent, angle);
                    doorEnd = Utilities.getVectorByVectorLengthAndAngle(doorStart, doorLength, angle - Constants.DOOR_ANGLE);
                }
                doorAttributes = {strokeWidth: Constants.DOOR_LINE_SIZE, stroke: Constants.DOOR_LINE_COLOR};
            } else {
                if (doorRotation === 'left') {
                    doorStart = Utilities.getVectorByVectorLengthAndAngle(wallEnd, doorIndent + doorLength, angle);
                    doorEnd = Utilities.getVectorByVectorLengthAndAngle(doorStart, doorLength, angle - 180);
                } else {
                    doorStart = Utilities.getVectorByVectorLengthAndAngle(wallEnd, doorIndent, angle);
                    doorEnd = Utilities.getVectorByVectorLengthAndAngle(doorStart, doorLength, angle);
                }

                //Extra mutation on doorStart and doorEnd when doorType is sliding to position next to the wall.
                doorStart = Utilities.getVectorByVectorLengthAndAngle(doorStart, Constants.DOOR_SLIDER_DISTANCE, angle - 90);
                doorEnd = Utilities.getVectorByVectorLengthAndAngle(doorEnd, Constants.DOOR_SLIDER_DISTANCE, angle - 90);
                doorAttributes = {
                    strokeWidth: Constants.DOOR_LINE_SIZE,
                    stroke: Constants.DOOR_LINE_COLOR,
                    markerEnd: drawingAttributes.arrowMarker
                };
            }

            return drawLineBetweenVectors(doorStart, doorEnd).attr(doorAttributes);
        }

        function updateViewbox() {
            var dimensions = getShapeDimensions();

            paper.attr({viewBox: '-' + Constants.SHAPE_PADDING + ' -' + Constants.SHAPE_PADDING + ' ' + (dimensions.width + (Constants.SHAPE_PADDING * 2)) + ' ' + (dimensions.height + (Constants.SHAPE_PADDING * 2))});
        }

        function getShapeDimensions() {
            var width = Summerhouse.width, height = Summerhouse.depth;

            width += (Summerhouse.walls.B.canopy) ? Summerhouse.walls.B.canopy.depth + Summerhouse.walls.B.overhang : Summerhouse.walls.B.overhang;
            width += (Summerhouse.walls.D.canopy) ? Summerhouse.walls.D.canopy.depth + Summerhouse.walls.D.overhang : Summerhouse.walls.D.overhang;
            height += (Summerhouse.walls.A.canopy) ? Summerhouse.walls.A.canopy.depth + Summerhouse.walls.A.overhang : Summerhouse.walls.A.overhang;
            height += (Summerhouse.walls.C.canopy) ? Summerhouse.walls.C.canopy.depth + Summerhouse.walls.C.overhang : Summerhouse.walls.C.overhang;

            return {'width': width, 'height': height};
        }

        function initialize() {
            /* Calculate the values of the summerhouse (coordinates and lengths) */
            calculateSummerhouseValues();

            /* Update the paper viewbox based on width and depth */
            updateViewbox();

            /* Start drawing the summerhouse */
            drawSummerhouse();
        }

        /* Public functions */
        this.redraw = function (newAttributes) {
            if (newAttributes) {
                Summerhouse = newAttributes;
                paper.clear();
                initialize();
            }
        };

        this.export = function (type) {
            switch (type) {
                case 'json':
                    return JSON.stringify(Summerhouse);
                case 'svg':
                default:
                    return paper.toString();
            }
        };

        this.test = {
            all: function () {
                this.hasFullyChainedCanopy();
                this.chainedCanopyWalls();
                this.nextWallByDrawingOrder();
                this.previousWallByDrawingOrder();
            },
            hasFullyChainedCanopy: function () {
                console.info('Testing if drawing has fully chained canopy');
                console.log(hasFullyChainedCanopy());
            },
            chainedCanopyWalls: function () {
                console.info('Testing chained canopy for walls A - D');
                console.log(getChainedWallsWithCanopyByWall(Summerhouse.walls.A, 'parent', []));
                console.log(getChainedWallsWithCanopyByWall(Summerhouse.walls.B, 'parent', []));
                console.log(getChainedWallsWithCanopyByWall(Summerhouse.walls.C, 'parent', []));
                console.log(getChainedWallsWithCanopyByWall(Summerhouse.walls.D, 'parent', []));
            },
            nextWallByDrawingOrder: function () {
                console.info('Testing next wall by drawing order for walls A - E');
                console.log(getNextWallByDrawingOrder(Summerhouse.walls.A));
                console.log(getNextWallByDrawingOrder(Summerhouse.walls.B));
                console.log(getNextWallByDrawingOrder(Summerhouse.walls.C));
                console.log(getNextWallByDrawingOrder(Summerhouse.walls.D));
                console.log(getNextWallByDrawingOrder(Summerhouse.walls.E));
            },
            previousWallByDrawingOrder: function () {
                console.info('Testing previous wall by drawing order for walls A - E');
                console.log(getPreviousWallByDrawingOrder(Summerhouse.walls.A));
                console.log(getPreviousWallByDrawingOrder(Summerhouse.walls.B));
                console.log(getPreviousWallByDrawingOrder(Summerhouse.walls.C));
                console.log(getPreviousWallByDrawingOrder(Summerhouse.walls.D));
                console.log(getPreviousWallByDrawingOrder(Summerhouse.walls.E));
            }
        };

        /* returning isn't necessary */
        return initialize();
    }

    parent.TuinhuisjesDrawer = TuinhuisjesDrawer;

    return TuinhuisjesDrawer();
})(window || this, Snap);

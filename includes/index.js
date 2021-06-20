var context;
var canvasHeight;
var canvasWidth;
var colors = ['#8814fc', '#b400cc', '#00ffd9', '#b400cc', '#ba54a2', '#ff409c', '#FF00FF', '#995eff'];
var cast = 0;
var pointArray = []

//Array of the points devided by X Y and Z
var xArray = new Array(), yArray = new Array(), zArray = new Array();


//Array of shapes
var shapesArray = new Array();

//Class Point
function Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}
var minPoint = new Point(0, 0, 0);
var maxPoint = new Point(0, 0, 0);
var centerPoint = new Point(0, 0, 0);



//Polygon visibility
function setVisibility() {
    var Ax = xArray[this.points[0]] - xArray[this.points[1]];
    var Ay = yArray[this.points[0]] - yArray[this.points[1]];
    var Az = zArray[this.points[0]] - zArray[this.points[1]];

    var Bx = xArray[this.points[2]] - xArray[this.points[1]];
    var By = yArray[this.points[2]] - yArray[this.points[1]];
    var Bz = zArray[this.points[2]] - zArray[this.points[1]];

    //Vector
    var normalX = (Ay * Bz) - (Az * By);
    var normalY = (Az * Bx) - (Ax * Bz);
    var normalZ = (Ax * By) - (Ay * Bx);
    //Scalar with vertex
    this.visibility = normalX * 100 + normalY * 100 + normalZ * (-200);
}


//Draw the picked polygon
function drawPolygon(color) {
    context.fillStyle = color;
    context.beginPath();

    context.moveTo(this.pointValue[0].x, this.pointValue[0].y);
    for (var i = 1; i < this.pointValue.length; i++)
        context.lineTo(this.pointValue[i].x, this.pointValue[i].y);

    context.lineTo(this.pointValue[0].x, this.pointValue[0].y);

    context.fill();
    context.closePath();
}

//Class Polygon
function polygon(size) {

    this.visibility = 0;
    this.size = size;
    this.points = new Array(size);
    this.pointValue = new Array(size);
    for (var i = 0; i < size; i++)
        this.pointValue[i] = new Point(0, 0);

    this.setVisibility = setVisibility;
    this.draw = drawPolygon;
    this.casting = casting;
}

//Cast the polygon on the screen by the chosen option:
//Parallel, Oblique or Perspective
function casting() {
    var temp;

    for (var j = 0; j < this.size; j++) {
        var i = this.points[j];
        temp = xArray[i];

        //Parallel casting
        if (cast == 0) {
            this.pointValue[j].x = xArray[i];
            this.pointValue[j].y = yArray[i];
        }
        //Oblique casting
        if (cast == 1) {
            this.pointValue[j].x = Math.round(xArray[i] + zArray[i] * Math.cos(Math.PI * (45 / 180)));
            this.pointValue[j].y = Math.round(yArray[i] + zArray[i] * Math.sin(Math.PI * (45 / 180)));
        }
        //Perspective casting
        if (cast == 2) {
            this.pointValue[j].x = xArray[i] + (zArray[i] / 10);
            this.pointValue[j].y = yArray[i] + (zArray[i] / 10);
        }
        if (!temp) {
            this.pointValue[j].x = shapesArray[0].polygons[3].pointValue[2].x;
            this.pointValue[j].y = shapesArray[0].polygons[3].pointValue[2].y;
        }
    }

}

//Class Shape
//Get the number of faces and draw the correct shape by the number of faces
//If 6 - CUBE
//If 4 - PYRAMID
function Shape(face) {

    this.face = face;
    this.polygons = new Array(face);

    for (var i = 0; i < face; i++)
        this.polygons[i] = new polygon((face / 2) + 1);
    //Cube
    if (face == 6)
        this.setPoly = cubeVertexPoints;
    //Pyramid
    else
        this.setPoly = pyramidVertexPoints;
    this.draw = drawObject;
    this.setVisibility = setVisibilityShape;
    this.casts = castShape;

}

//Set the cube vertex points
function cubeVertexPoints(i, a, b, c, d) {
    this.polygons[i].points[0] = a;
    this.polygons[i].points[1] = b;
    this.polygons[i].points[2] = c;
    this.polygons[i].points[3] = d;
}

//Set the pyramid vertex points
function pyramidVertexPoints(i, a, b, c) {
    this.polygons[i].points[0] = a;
    this.polygons[i].points[1] = b;
    this.polygons[i].points[2] = c;
}

//Change the visibility property of each polygon at the shape
function setVisibilityShape() {
    for (i in this.polygons) {
        this.polygons[i].setVisibility();
    }
}


//Draw the polygons at the shape
function drawObject() {
    for (var i = 0; i < this.face; i++) {
        if (this.polygons[i].visibility < 0)
            this.polygons[i].draw(colors[i]);
    }
}

//Projcets shapes
function castShape() {
    for (i in this.polygons) {
        this.polygons[i].casting();
    }
}

//Open canvas and get the size of it when the page load is done
window.onload = function () {
    var canvas = document.getElementById('canvas-container');
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;
    if (canvas && canvas.getContext) {
        var contextObj = canvas.getContext('2d');
        if (contextObj)
            context = contextObj;
    }
}

// Opens the input file and draw shapes
function openFile() {
    var slice;
    var file = document.getElementById('fileOpen').files;

    if (!file.length) {
        alert('No file selected!');
        return;
    }

    var file = file[0];
    var fileReader = new FileReader();

    fileReader.onloadend = function (event) {
        if (event.target.readyState == FileReader.DONE) {
            var fileContent = fileReader.result;

            if (!fileContent.length) {
                alert('File is empty'); return;
            }

            var lines = fileContent.split('\n');

            var j, k, t
            var shapeIndex = 0
            for (let i = 0; i < lines.length; i++) {
                var specificLine = fileContent.split('\n')[i]
                if (specificLine.includes('point')) {
                    j = i
                } if (specificLine.includes('cube')) {
                    k = i
                }
                if (specificLine.includes('pyramid')) {
                    t = i
                }
            }
            if (j === undefined && k === undefined && t === undefined) {
                alert('There is no shape in the file'); return;
            }
            for (; j < k - 1; j++) {
                var specificLine = fileContent.split('\n')[j + 1]
                specificLine = specificLine.replace('(', '');
                specificLine = specificLine.replace('"', '');
                specificLine = specificLine.replace(')', '');
                specificLine = specificLine.split(',')
                xArray.push(parseInt(specificLine[0]))
                yArray.push(parseInt(specificLine[1]))
                zArray.push(parseInt(specificLine[2]))
                pointArray.push(specificLine)
            }
            var cube = new Shape(6);
            for (let count = 0; k < t - 1; k++) {
                var specificLine = fileContent.split('\n')[k + 1]
                specificLine = specificLine.replace('"', '');
                specificLine = specificLine.replace('(', '');
                specificLine = specificLine.replace(')', '');
                specificLine = specificLine.split('-')
                if (specificLine.length != 4) {
                    alert('Illegal input for cube');
                    return;
                }
                cube.setPoly(count, specificLine[0], specificLine[1], specificLine[2], specificLine[3]);
                count++
            }
            shapesArray[shapeIndex++] = cube;

            var payramid = new Shape(4);
            for (let count = 0; t < lines.length - 1; t++) {
                var specificLine = fileContent.split('\n')[t + 1]
                specificLine = specificLine.replace('(', '');
                specificLine = specificLine.replace('"', '');
                specificLine = specificLine.replace(')', '');
                specificLine = specificLine.split('-')
                if (specificLine.length != 3) {
                    alert('Illegal input for pyramid');
                    return;
                }
                payramid.setPoly(count, specificLine[0], specificLine[1], specificLine[2]);
                count++
            }
            shapesArray[shapeIndex++] = payramid;
            drawShapes();
        }
    }
    if (file.slice) {
        slice = file.slice(0, file.size);
    }
    else if (file.webkitSlice) {
        slice = file.webkitSlice(0, file.size);
    }
    else if (file.mozSlice) {
        slice = file.mozSlice(0, file.size);
    }
    fileReader.readAsText(slice);
}

// Draw the shapes with the selected projectation
// n = 0 Parallel
// n = 1 Oblique
// n = 2 Perspective
function selectedCast(n) {
    cast = n;
    drawShapes();

}

//Rotate the objects on the cartesian coordinate system
function rotate(coordinateSystem) {

    var protractor = document.getElementById('protractor').value;;
    protractor = protractor * (Math.PI / 180);
    var x;
    var y;

    //Rotation in X coordination
    if (coordinateSystem == 'x') {
        for (var i = 0; i < xArray.length; i++) {
            y = yArray[i];
            yArray[i] = yArray[i] * Math.cos(protractor) - zArray[i] * Math.sin(protractor);
            zArray[i] = y * Math.sin(protractor) + zArray[i] * Math.cos(protractor);
        }
    }
    //Rotation in Y coordination
    if (coordinateSystem == 'y') {
        for (var i = 0; i < yArray.length; i++) {
            x = xArray[i];
            xArray[i] = xArray[i] * Math.cos(protractor) + zArray[i] * Math.sin(protractor);
            zArray[i] = -x * Math.sin(protractor) + zArray[i] * Math.cos(protractor);
        }
    }
    //Rotation in Z coordination
    if (coordinateSystem == 'z') {
        for (var i = 0; i < zArray.length; i++) {
            x = xArray[i];
            xArray[i] = xArray[i] * Math.cos(protractor) - yArray[i] * Math.sin(protractor);
            yArray[i] = x * Math.sin(protractor) + yArray[i] * Math.cos(protractor);
        }
    }
    drawShapes();
}

//Draw the shapes
function drawShapes() {
    fitImage();
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    for (var i = 0; i < shapesArray.length; i++) {
        shapesArray[i].setVisibility();
        shapesArray[i].casts();
        shapesArray[i].draw();
    }
}

//Fit the shapes at the center of the screen
function fitImage() {
    center();
    var point = new Point(canvasWidth / 2, canvasHeight / 2, 150);
    for (var i = 0; i < xArray.length; i++) {
        xArray[i] += point.x - centerPoint.x;
        yArray[i] += point.y - centerPoint.y;
        zArray[i] += point.z - centerPoint.z;
    }
    center();
}

function center() {
    minPoint.x = Math.min.apply(0, xArray);
    minPoint.y = Math.min.apply(0, yArray);
    minPoint.z = Math.min.apply(0, zArray);
    maxPoint.x = Math.max.apply(0, xArray);
    maxPoint.y = Math.max.apply(0, yArray);
    maxPoint.z = Math.max.apply(0, zArray);
    centerPoint.x = Math.round(maxPoint.x - ((maxPoint.x - minPoint.x) / 2));
    centerPoint.y = Math.round(maxPoint.y - ((maxPoint.y - minPoint.y) / 2));
    centerPoint.z = Math.round(maxPoint.z - ((maxPoint.z - minPoint.z) / 2));
}

//Active after pressing the + and - buttons.

//Zoom in function after press +
function zoomIn() {
    var oldCenter = centerPoint;
    for (var i = 0; i < xArray.length; i++) {
        xArray[i] *= 1.1;
        yArray[i] *= 1.1;
        zArray[i] *= 1.1;
    }
    center();
    for (var i = 0; i < xArray.length; i++) {
        xArray[i] -= centerPoint.x - oldCenter.x;
        yArray[i] -= centerPoint.y - oldCenter.y;
    }
    drawShapes();
}

//Zoom in function after press -

function zoomOut() {
    var oldCenter = centerPoint;
    for (var i = 0; i < xArray.length; i++) {
        xArray[i] *= 0.9;
        yArray[i] *= 0.9;
        zArray[i] *= 0.9;
    }
    center();
    for (var i = 0; i < xArray.length; i++) {
        xArray[i] -= centerPoint.x - oldCenter.x;
        yArray[i] -= centerPoint.y - oldCenter.y;
    }
    drawShapes();
}
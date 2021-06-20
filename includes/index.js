var ctx;
var canvasHeight;
var canvasWidth;
var colors = ["#8814fc", "#b400cc", "#00ffd9", "#b400cc", "#ba54a2", "#ff409c", "#FF00FF", "#995eff"];
var project = 0;
var pointArray = []


var xArray = new Array(), yArray = new Array(), zArray = new Array(); 
var shapesArray = new Array(); //  insert all the shapes to array 

function Point(x, y, z) //point class
{
    this.x = x;
    this.y = y;
    this.z = z;
}
var minPoint = new Point(0, 0, 0);
var maxPoint = new Point(0, 0, 0);
var centerPoint = new Point(0, 0, 0);

/*********************POLYGPN************************************/
function polygon(size) {

    this.visibility = 0;
    this.size = size;
    this.points = new Array(size);
    this.pointValue = new Array(size);
    for (var i = 0; i < size; i++)
        this.pointValue[i] = new Point(0, 0);

    this.setVisibility = setVisibility;
    this.draw = createPolygon;
    this.projction = projction;
}
/*************************************
**	function: setVisibility
**calculate the polygon's visibility
**negative -> visible
*************************************/
function setVisibility() {
    var Ax = xArray[this.points[0]] - xArray[this.points[1]];
    var Ay = yArray[this.points[0]] - yArray[this.points[1]];
    var Az = zArray[this.points[0]] - zArray[this.points[1]];

    var Bx = xArray[this.points[2]] - xArray[this.points[1]];
    var By = yArray[this.points[2]] - yArray[this.points[1]];
    var Bz = zArray[this.points[2]] - zArray[this.points[1]];

    //vector  product
    var normalX = (Ay * Bz) - (Az * By);
    var normalY = (Az * Bx) - (Ax * Bz);
    var normalZ = (Ax * By) - (Ay * Bx);
    // scalar product with vertex
    this.visibility = normalX * 100 + normalY * 100 + normalZ * (-200);
}

/***************************************
    function: createPolygon
    draw the current polygon	
***************************************/
function createPolygon(clr) {
    ctx.fillStyle = clr;
    ctx.beginPath();

    ctx.moveTo(this.pointValue[0].x, this.pointValue[0].y);
    for (var i = 1; i < this.pointValue.length; i++)
        ctx.lineTo(this.pointValue[i].x, this.pointValue[i].y);

    ctx.lineTo(this.pointValue[0].x, this.pointValue[0].y);

    ctx.fill();
    ctx.closePath();
}

/***************************************
    function: projction
**projct the poly' on the screen by the 
**chosen(paraller,cabinet,or prespctive)
***************************************/
function projction() {
    var temp;

    for (var j = 0; j < this.size; j++) {
        var i = this.points[j];
        temp = xArray[i];
        if (project == 0) {//paraller projction
            this.pointValue[j].x = xArray[i];
            this.pointValue[j].y = yArray[i];
        }
        if (project == 1) { //cabinet projction
            this.pointValue[j].x = Math.round(xArray[i] + zArray[i] * Math.cos(Math.PI * (45 / 180)));
            this.pointValue[j].y = Math.round(yArray[i] + zArray[i] * Math.sin(Math.PI * (45 / 180)));
        }
        if (project == 2) {//prespctive projction
            this.pointValue[j].x = xArray[i] + (zArray[i] / 10);
            this.pointValue[j].y = yArray[i] + (zArray[i] / 10);
        }
        if (!temp) {
            this.pointValue[j].x = shapesArray[0].polys[3].pointValue[2].x;
            this.pointValue[j].y = shapesArray[0].polys[3].pointValue[2].y;
        }
    }

}

/****************************Shape****************************************/

function Shape(face) {

    this.face = face;
    this.polys = new Array(face);

    for (var i = 0; i < face; i++)
        this.polys[i] = new polygon((face / 2) + 1);
    if (face == 6)//cube
        this.setPoly = addPoly;
    else //pyramid
        this.setPoly = addPoly3;
    this.draw = drawObject;
    this.setVisibility = setVisibilityShape;
    this.projct = projctShap;

}
/***************************************
*	functions: addPoly & addPoly3
*	set the polygon vertexs
*	input: poly number and vertex; 
**************************************/
function addPoly(i, a, b, c, d) {
    this.polys[i].points[0] = a;
    this.polys[i].points[1] = b;
    this.polys[i].points[2] = c;
    this.polys[i].points[3] = d;
}

function addPoly3(i, a, b, c) {
    this.polys[i].points[0] = a;
    this.polys[i].points[1] = b;
    this.polys[i].points[2] = c;
}
/***************************************
*	function: setVisibilityShape
*	for eath polygon in shap: set Visibility
**************************************/
function setVisibilityShape() {
    for (i in this.polys) { this.polys[i].setVisibility(); }
}
/***************************************
*	function: drawObject
*	draw  eath polygon in shap
**************************************/
function drawObject() {
    for (var i = 0; i < this.face; i++) {
        if (this.polys[i].visibility < 0)
            this.polys[i].draw(colors[i]);
    }
}

function projctShap() {
    for (i in this.polys) { this.polys[i].projction(); }
}

/**********on loed open canvas and get canvas size**********/
window.onload = function () {
    var canvas = document.getElementById("main-canvas");
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;
    if (canvas && canvas.getContext) {
        var contextObj = canvas.getContext("2d");
        if (contextObj)
            ctx = contextObj;
    }
}

/**********Opens the file input and draw the cube and pyramid**********/

function openFile() {
    var slice;
    var file = document.getElementById('fileOpen').files;

    if (!file.length) {
        alert("No file selected!");
        return;
    }

    var file = file[0];
    var fileReader = new FileReader();

    fileReader.onloadend = function (event) {
        if (event.target.readyState == FileReader.DONE) {
            var fileContent = fileReader.result;

            if (!fileContent.length) {
                alert("File is empty"); return;
            }

            var lines = fileContent.split("\n");

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
                alert("There is no shape in the file"); return;
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
                    alert("Illegal input for cube");
                    return;
                }
                cube.setPoly(count, specificLine[0], specificLine[1], specificLine[2], specificLine[3]);
                count++
            }
            shapesArray[shapeIndex++] = cube;

            var payramid=new Shape(4);
            for (let count = 0; t < lines.length - 1; t++) {
                var specificLine = fileContent.split('\n')[t + 1]
                specificLine = specificLine.replace('(', '');
                specificLine = specificLine.replace('"', '');
                specificLine = specificLine.replace(')', '');
                specificLine = specificLine.split('-')
                if (specificLine.length != 3) {
                    alert("Illegal input for pyramid");
                    return;
                }
                payramid.setPoly(count, specificLine[0], specificLine[1], specificLine[2]);
                console.log('payramid:', payramid)
                count++
            }
            shapesArray[shapeIndex++] = payramid;
            drawshapesArray();
        }
    }
    if (file.slice) { slice = file.slice(0, file.size); }
    else if (file.webkitSlice) { slice = file.webkitSlice(0, file.size); }
    else if (file.mozSlice) { slice = file.mozSlice(0, file.size); }
    fileReader.readAsText(slice);
}
/******************************************
** Function:projections
**Opens a file and draws its content
****************************************/
function projections(n) {
    project = n;
    drawshapesArray();

}
/******************************************
** Function:rotate
**Rotate the objects by X,Y,Z coordinations
****************************************/
function rotate(n) {

    var protractor = document.getElementById('protractor').value;;
    protractor = protractor * (Math.PI / 180); 
    var tempX;
    var tempY;

    switch (n) {
        case 1://Rotation in X coordination
            {
                for (var i = 0; i < xArray.length; i++) {
                    tempY = yArray[i];
                    yArray[i] = yArray[i] * Math.cos(protractor) - zArray[i] * Math.sin(protractor);
                    zArray[i] = tempY * Math.sin(protractor) + zArray[i] * Math.cos(protractor);
                }
            } break;
        case 2://Rotation in Y coordination
            {
                for (var i = 0; i < yArray.length; i++) {
                    tempX = xArray[i];
                    xArray[i] = xArray[i] * Math.cos(protractor) + zArray[i] * Math.sin(protractor);
                    zArray[i] = -tempX * Math.sin(protractor) + zArray[i] * Math.cos(protractor);
                }
            } break;
        case 3://Rotation in Z coordination
            {
                for (var i = 0; i < zArray.length; i++) {
                    tempX = xArray[i];
                    xArray[i] = xArray[i] * Math.cos(protractor) - yArray[i] * Math.sin(protractor);
                    yArray[i] = tempX * Math.sin(protractor) + yArray[i] * Math.cos(protractor);
                }
            } break;

    }

    drawshapesArray();
}
/******************************************
** Function:rotate
**Draw all the shapes from the shapesArray 
****************************************/
function drawshapesArray() {
    fitImage();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (var i = 0; i < shapesArray.length; i++) {
        shapesArray[i].setVisibility();
        shapesArray[i].projct();
        shapesArray[i].draw();
    }
}
/******************************************
** Function:fitImage
** Fit the image to the screen size
****************************************/
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
 /**********two function zoom in and zoom out**********/
 /**********Active after pressing the + and - buttons.**********/
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
    drawshapesArray();
}

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
    drawshapesArray();
}
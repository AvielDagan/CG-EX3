
var pointArray = []
var cubeArray = []
var pyramidArray = []
var totalRes = []

const organizeData = async () => {
    var slice;
    var file = document.getElementById('input-file').files;
    if (!file.length) {
        alert("Please select a file");
        return;
    }

    file = file[0];
    var fileReader = new FileReader();

    fileReader.onloadend = await function (event) {
        if (event.target.readyState == FileReader.DONE) {
            var fileContent = fileReader.result;

            if (!fileContent.length) {
                alert("File is empty"); return;
            }
            console.log('fileContent:', fileContent)
            var lines = fileContent.split("\n");
            var j, k, t
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
                pointArray.push(specificLine)
            }
            // console.log('pointArray:', pointArray)
            for (; k < t - 1; k++) {
                var specificLine = fileContent.split('\n')[k + 1]
                specificLine = specificLine.replace('"', '');
                specificLine = specificLine.replace('(', '');
                specificLine = specificLine.replace(')', '');
                specificLine = specificLine.split('-')
                cubeArray.push(specificLine)
            }
            // console.log('cubeArray:', cubeArray)
            for (; t < lines.length - 1; t++) {
                var specificLine = fileContent.split('\n')[t + 1]
                specificLine = specificLine.replace('(', '');
                specificLine = specificLine.replace('"', '');
                specificLine = specificLine.replace(')', '');
                specificLine = specificLine.split('-')
                pyramidArray.push(specificLine)
            }
            // console.log('pyramidArray:', pyramidArray)
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
    totalRes = [pointArray, cubeArray, pyramidArray]
    return totalRes;
}
function showCube(shape, points, zoomInFlag) {
    const Point3D = function (x, y, z) { this.x = x; this.y = y; this.z = z; };
    const Point2D = function (x, y) { this.x = x; this.y = y; };

    const Cube = function (x, y, z, size) {


        Point3D.call(this, x, y, z);

        size *= 0.5;
        console.log('points:', points)
        this.vertices = points
        console.log('this.vertices:', this.vertices)
        this.faces = shape
    };

    Cube.prototype = {

        rotateX: function (radian) {

            var cosine = Math.cos(radian);
            var sine = Math.sin(radian);

            for (let index = this.vertices.length - 1; index > -1; --index) {

                let p = this.vertices[index];

                let y = (p.y - this.y) * cosine - (p.z - this.z) * sine;
                let z = (p.y - this.y) * sine + (p.z - this.z) * cosine;

                p.y = y + this.y;
                p.z = z + this.z;

            }
        },

        rotateY: function (radian) {

            var cosine = Math.cos(radian);
            var sine = Math.sin(radian);

            for (let index = this.vertices.length - 1; index > -1; --index) {

                let p = this.vertices[index];

                let x = (p.z - this.z) * sine + (p.x - this.x) * cosine;
                let z = (p.z - this.z) * cosine - (p.x - this.x) * sine;

                p.x = x + this.x;
                p.z = z + this.z;

            }

        }

    };

    var context = document.querySelector("canvas").getContext("2d");
    var pointer = new Point2D(0, 0);
    var cube = new Cube(0, 0, 400, 200);
    var height = document.documentElement.clientHeight;
    var width = document.documentElement.clientWidth;

    function project(points3d, width, height) {

        var points2d = new Array(points3d.length);

        var focal_length = 200;

        for (let index = points3d.length - 1; index > -1; --index) {

            let p = points3d[index];

            let x = p.x * (focal_length / p.z) + width * 0.5;
            let y = p.y * (focal_length / p.z) + height * 0.5;

            points2d[index] = new Point2D(x, y);

        }

        return points2d;

    }

    function loop() {

        window.requestAnimationFrame(loop);

        height = document.documentElement.clientHeight;
        width = document.documentElement.clientWidth;

        context.canvas.height = height;
        context.canvas.width = width;

        context.fillStyle = "rgba(168,110,144,0.800000011920929)";
        context.fillRect(0, 0, width, height);
        context.strokeStyle = "#ffffff";

        // cube.rotateX(pointer.y * 0.0001);
        // cube.rotateY(-pointer.x * 0.0001);

        context.fillStyle = "#0080f0";

        var vertices = project(cube.vertices, width, height);

        for (let index = cube.faces.length - 1; index > -1; --index) {

            let face = cube.faces[index];

            let p1 = cube.vertices[face[0]];
            let p2 = cube.vertices[face[1]];
            let p3 = cube.vertices[face[2]];
            let v1 = new Point3D(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
            let v2 = new Point3D(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);

            let n = new Point3D(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);

            if (-p1.x * n.x + -p1.y * n.y + -p1.z * n.z <= 0) {

                context.beginPath();
                context.moveTo(vertices[face[0]].x, vertices[face[0]].y);
                context.lineTo(vertices[face[1]].x, vertices[face[1]].y);
                context.lineTo(vertices[face[2]].x, vertices[face[2]].y);
                context.lineTo(vertices[face[3]].x, vertices[face[3]].y);
                context.closePath();
                context.fill();
                context.stroke();
            }
        }
    }

    loop();

    // window.addEventListener("click", (event) => {

    //     pointer.x = event.pageX - width * 0.5;
    //     pointer.y = event.pageY - height * 0.5;

    // });
}

function organizePoints(points, size = null) {
    const Point3D = function (x, y, z) { this.x = x; this.y = y; this.z = z; };
    var objOfPoints = []
    console.log('size:', size)
    if (!size) {
        for (let i = 0; i < points.length; ++i) {
            let x = points[i][0]
            x = x.replace('"', '');
            x = parseInt(x)
            let y = points[i][1]
            y = y.replace('"', '');
            y = parseInt(y)
            let z = points[i][2]
            z = z.replace('"', '');
            z = parseInt(z)
            let point = new Point3D(x, y, z)
            objOfPoints.push(point)
        }
    } else {
        for (let i = 0; i < points.length; ++i) {
            // let x = parseInt(points[i][0])
            // let y = parseInt(points[i][1])
            // y = parseInt(y * size)
            let x = points[i][0] * size
            x = parseInt(x)
            let y = points[i][1] * size
            y = parseInt(y)
            let z = points[i][2] * size
            // z = parseInt(z * size)
            let point = new Point3D(x, y, z)
            objOfPoints[i] = point
            // objOfPoints[i] = points[i]
        }
        objOfPoints = objOfPoints.splice(0, 8)
        console.log('objOfPoints in zoo,=m:', objOfPoints)
    }
    console.log('before return objOfPoints:', objOfPoints)
    return objOfPoints
}

async function zoomIn() {
    try {
        var result = await organizeData()
        setTimeout(function () {
            var shape = result[1]
            var points = result[0]
            var zoomInFlag = true
            var zoomPoints = organizePoints(points, 1.1)
            showCube(shape, zoomPoints, zoomInFlag);
        }, 1000);

    }
    catch (e) {
        console.log('e:', e)
    }
}

async function start() {
    try {
        var result = await organizeData()
        setTimeout(function () {
            var shape = result[1]
            var points = result[0]
            points = organizePoints(points)
            var zoomInFlag = false
            showCube(shape, points, zoomInFlag);
        }, 1000);

    }
    catch (e) {
        console.log('e:', e)
    }
}
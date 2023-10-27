var baseRadius = 20;
var numberOfRows = 30; 

$(document).ready(function() {
    var img = new Image();
    img.onload = function() {
        drawResponsiveGrid(img);
        $(window).resize(function() {
            drawResponsiveGrid(img);
        });
    };
    img.src = 'https://images.unsplash.com/photo-1696229250077-bf5e4d7f7106?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2OTczMTgzNzl8&ixlib=rb-4.0.3&q=85';
});

function drawResponsiveGrid(img) {
    var scale = window.innerWidth / img.width;
    var scaledImageHeight = img.height * scale;

    // Calculate the maximum number of rows based on the scaled image height
    var maxRowsBasedOnImage = Math.floor(scaledImageHeight / (baseRadius * 1.5));

    // Use the smaller value between maxRowsBasedOnImage and numberOfRows
    var rowsToUse = Math.min(maxRowsBasedOnImage, numberOfRows);

    var totalHeight = baseRadius * 1.5 * rowsToUse;

    $('.hero').height(totalHeight + 'px');
    
    grid('hex', 10, 10, window.innerWidth, totalHeight, img);
    $("#gridContainer").off("mousemove mouseenter");
    $("#gridContainer").on("mousemove mouseenter", function(e) {
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        hoverHex(x, y, img);
    });
}



function grid(type, w, h, totalW, totalH, img) {
    $('#grid').empty();
    var container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.width = '100%';
    container.style.height = '100%';
    container.id = 'gridContainer';
    var c = document.createElement("canvas");
    c.width = totalW;
    c.height = totalH;
    if (type === 'hex') {
        drawHexGrid({}, c, totalW, totalH, img);
    }
    container.appendChild(c);
    document.getElementById('grid').appendChild(container);
}

function drawHexGrid(opts, c, totalW, totalH, img) {
    var color = '#1e1e1e';
    var lineWidth = 1;
    var radius = baseRadius;
    var mapGridCanvas = c.getContext("2d");
    mapGridCanvas.strokeStyle = color;
    mapGridCanvas.lineWidth = lineWidth;
    var hexSize = radius * Math.sqrt(3);
    var yHexSize = radius * 1.5;
    
    // Extend the grid beyond the right by adding an additional column
    var xHexes = Math.ceil(totalW / hexSize) + 1;
    var yHexes = totalH / yHexSize;
    
    for (let xGrid = 0; xGrid < xHexes; xGrid++) {
        for (let yGrid = 0; yGrid < yHexes; yGrid++) {
            var shiftX = (yGrid % 2 === 0) ? hexSize / 2 : 0;
            
            // Check if the hexagon would be within the image bounds
            if ((yGrid * yHexSize + radius) <= img.height) {
                drawSingleHexagon(xGrid, yGrid, radius, mapGridCanvas, hexSize, yHexSize, shiftX, img);
            }
        }
    }
}

function drawSingleHexagon(xGrid, yGrid, radius, context, hexSize, yHexSize, shiftX, img) {
    var part = 60;
    context.beginPath();
    var hexVertices = [];
    for (let i = 0; i <= 6; i++) {
        var a = i * part - 90;
        var x = radius * Math.cos(a * Math.PI / 180) + xGrid * hexSize + shiftX;
        var y = radius * Math.sin(a * Math.PI / 180) + yGrid * yHexSize;
        hexVertices.push({x, y});
        if (i === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    }
    context.closePath();
    context.stroke();
    context.save();
    context.clip();
    var scale = window.innerWidth / img.width;
    context.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * scale, img.height * scale);
    context.restore();
}

function hoverHex(mouseX, mouseY, img) {
    var c = document.getElementById('gridContainer').getElementsByTagName('canvas')[0];
    var context = c.getContext("2d");
    var radius = baseRadius;  // Using the baseRadius to ensure consistency
    var hexSize = radius * Math.sqrt(3);
    var yHexSize = radius * 1.5;
    var xHexes = c.width / hexSize;
    var yHexes = c.height / yHexSize;
    drawHexGrid({}, c, c.width, c.height, img);
    for (let xGrid = 0; xGrid < xHexes; xGrid++) {
        for (let yGrid = 0; yGrid < yHexes; yGrid++) {
            var shiftX = (yGrid % 2 === 0) ? hexSize / 2 : 0;
            var hexVertices = [];
            var part = 60;
            for (let i = 0; i <= 6; i++) {
                var a = i * part - 90;
                var x = radius * Math.cos(a * Math.PI / 180) + xGrid * hexSize + shiftX;
                var y = radius * Math.sin(a * Math.PI / 180) + yGrid * yHexSize;
                hexVertices.push({x, y});
            }
            if (isPointInHex(mouseX, mouseY, hexVertices)) {
                context.beginPath();
                hexVertices.forEach((vertex, index) => {
                    if (index === 0) {
                        context.moveTo(vertex.x, vertex.y);
                    } else {
                        context.lineTo(vertex.x, vertex.y);
                    }
                });
                context.closePath();
                context.fillStyle = 'rgba(255, 165, 0, 0.5)';
                context.fill();
            }
        }
    }
}

function isPointInHex(x, y, vertices) {
    var oddNodes = false;
    var j = 5;
    for (var i = 0; i < 6; i++) {
        if (vertices[i].y < y && vertices[j].y >= y || vertices[j].y < y && vertices[i].y >= y) {
            if (vertices[i].x + (y - vertices[i].y) / (vertices[j].y - vertices[i].y) * (vertices[j].x - vertices[i].x) < x) {
                oddNodes = !oddNodes;
            }
        }
        j = i;
    }
    return oddNodes;
}
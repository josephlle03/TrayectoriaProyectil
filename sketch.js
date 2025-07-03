


let enableExperimentalFeatures = false;


// Valores de área
const canvasWidth = 400;
const canvasHeight = 400;

let scaleFactor
let effectiveGridSpacing;

let scaledMousePos;

let pan = {x: 0, y: 0};
let previousMouse;
let isDragging = false;


// Valores estéticos
const projectileSize = 10;

const gridColor = [100, 100, 100];
const gridSpacing = 50;


// Valores de lógica de inspección
const inspectionSensibility = 5;
let inspectionThreshold;

let minDistance;
let closestPoint;

let pointMaxHeight;


// Valores de lógica de simulación
let deltaY;

let gravity, initialSpeed, angle;
let maxHeight, flightTime, range;

let time;
let currentPos = {x: 0, y: 0}
let trajectory = [];

let reachedMaxHeight = false;
let reachedGround = false;
let isRunning = false;


function setup()
{
	createCanvas(canvasWidth, canvasHeight).parent("panel-canvas");

	frameRate(240);

	strokeJoin(ROUND);
    strokeCap(ROUND);
}

function draw()
{
	background(50);

	push();

	
	if (enableExperimentalFeatures)
	{
		translate(pan.x, pan.y);
	}


	fill(255);
	stroke(255);
	strokeWeight(1 / scaleFactor);
	noFill();


	translate(0, canvasHeight);
	scale(scaleFactor, -scaleFactor);


	scaledMousePos =
	{
		x: (mouseX - pan.x) / scaleFactor,
		y: (canvasHeight - (mouseY - pan.y)) / scaleFactor
	};

	minDistance = Infinity;
	closestPoint = null;


	if (enableExperimentalFeatures)
	{
		drawGrid();
	}


	for (let i = 0; i < trajectory.length; i++)
	{
		let point01 = trajectory[i];
		
		if (i < trajectory.length - 1)
		{
			let point02 = trajectory[i + 1];
			renderTrajectory(point01, point02);
		}

		// d = distancia entre el mouse y cada punto de la trayectoria.
		let d = dist(scaledMousePos.x, scaledMousePos.y, point01.x, point01.y)
		if (d < minDistance)
		{
			minDistance = d;
			closestPoint = point01;
		}
	}


	if (closestPoint && minDistance <= inspectionThreshold)
	{
		renderInspectionPoint(closestPoint);
		updateInspectionValues(closestPoint);
	}
	else
	{
		clearInspectionValues();
	}


	if (reachedMaxHeight)
	{
		renderMaxHeightPoint();
	}


	if (isRunning)
	{
		let previousPos = {...currentPos};
		
		updatePosition();

		deltaY = currentPos.y - previousPos.y;

		if (!reachedMaxHeight && currentPos.y >= maxHeight - deltaY)
		{
			handleMaxHeight();
		}

		if (currentPos.x > 0 && currentPos.y > 0)
		{
			savePosition();
		}
		else if (currentPos.y <= 0 && previousPos.y > 0)
		{
			handleGroundCollison();
		}

		updateData();
	}
	
	renderProjectile();

	pop();

	if (enableExperimentalFeatures)
	{
		document.getElementById("button-reset-view").style.display = "block";
	}
	else
	{
		document.getElementById("button-reset-view").style.display = "none";
	}
}

function startSimulation()
{
	// Se recuperan los valores ingresados por el usuario.
	gravity = parseFloat(document.getElementById("gravity").value);
	initialSpeed = parseFloat(document.getElementById("initial-speed").value);
	angle = parseFloat(document.getElementById("angle").value) * Math.PI / 180;

	// Se desglosa la velocidad inicial en sus componentes.
	initialSpeed =
	{
		x: initialSpeed * Math.cos(angle),
		y: initialSpeed * Math.sin(angle)
	};

	// Se calculan la altura máxima, el tiempo de vuelo y el alcance horizontal.
	maxHeight = (initialSpeed.y ** 2) / (gravity * 2);
	flightTime = (initialSpeed.y * 2) / gravity;
	range = (initialSpeed.x * flightTime);

	// Se calcula delta de posición en eje Y sobre el intervalo de tiempo básico dentro de la simulación.
	deltaY = 0;

	// Se reestablece el tiempo.
	time = 0;

	// Se reestablece la posición del proyectil.
	currentPos = {x: 0, y: 0};

	// Se reestablece el arreglo de posiciones a lo largo de la trayectoria.
	// Cada elemento en dicho arreglo será un objeto con las características x & y.
	trajectory = [{x: 0, y: 0}];

	// Se ajustan los factores de escala.
	scaleFactor = Math.min(10, Math.min((canvasWidth / range), canvasHeight / (maxHeight)));
	effectiveGridSpacing = gridSpacing / scaleFactor;

	// Se ajusta la sensibilidad del punto de inspección.
	inspectionThreshold = inspectionSensibility / scaleFactor;

	// Se reestablecen los valores informativos.
	document.getElementById("max-height").innerText = "Altura máxima: 0m";
    document.getElementById("range").innerText = "Rango: 0m";
	document.getElementById("time").innerText = "Tiempo: 0s";
	document.getElementById("inspection-x").innerText = "X: 0m";
    document.getElementById("inspection-y").innerText = "Y: 0m";

	// Se reestablecen las banderas.
	reachedMaxHeight = false;
	reachedGround = false;

	// Se inicia la simulación.
	isRunning = true;
}


function mousePressed()
{
    if (enableExperimentalFeatures && mouseX >= 0 && mouseX <= canvasWidth && mouseY >= 0 && mouseY <= canvasHeight)
	{
        isDragging = true;
        previousMouse = {x: mouseX, y: mouseY};
    }
}

function mouseDragged()
{
	if (enableExperimentalFeatures)
	{
 		if (isDragging)
		{
        	pan.x += mouseX - previousMouse.x;
       		pan.y += mouseY - previousMouse.y;

        	previousMouse.x = mouseX;
        	previousMouse.y = mouseY;
    	}
	}
}

function mouseReleased()
{
	if (enableExperimentalFeatures)
	{
		isDragging = false;
	}
}


function drawGrid()
{
    push();

    stroke(gridColor);
    strokeWeight(1 / scaleFactor);

    let worldMin =
	{
		x: -pan.x / scaleFactor,
		y: pan.y / scaleFactor
	};

    let worldMax = 
	{
		x: (canvasWidth - pan.x) / scaleFactor,
		y: (pan.y + canvasHeight) / (scaleFactor)
	};

    worldMin.x = floor(worldMin.x / effectiveGridSpacing) * effectiveGridSpacing - effectiveGridSpacing;
    worldMax.x = ceil(worldMax.x / effectiveGridSpacing) * effectiveGridSpacing + effectiveGridSpacing;
    worldMin.y = floor(worldMin.y / effectiveGridSpacing) * effectiveGridSpacing - effectiveGridSpacing;
    worldMax.y = ceil(worldMax.y / effectiveGridSpacing) * effectiveGridSpacing + effectiveGridSpacing;

    for (let y = worldMin.y; y <= worldMax.y; y += effectiveGridSpacing)
	{
        line(worldMin.x, y, worldMax.x, y);
    }

    for (let x = worldMin.x; x <= worldMax.x; x += effectiveGridSpacing)
	{
        line(x, worldMin.y, x, worldMax.y);
    }

    pop();
}


function renderTrajectory(point01, point02)
{
	push();

	stroke(255);
	strokeWeight(1 / scaleFactor);

	line(point01.x, point01.y, point02.x, point02.y);

	pop();
}

function renderProjectile()
{
	push();

	fill(255);
	stroke(0);
	strokeWeight(0.5 / scaleFactor);

	ellipse(currentPos.x, currentPos.y, projectileSize / scaleFactor, projectileSize / scaleFactor);

	pop();
}

function handleMaxHeight()
{
	reachedMaxHeight = true;

	time = flightTime / 2;

	currentPos = {x: range / 2, y: maxHeight};

	savePosition();

	pointMaxHeight = {x: range / 2, y: maxHeight};

	document.getElementById("max-height").innerText = `Altura máxima: ${currentPos.y.toFixed(3)}m`;
}

function handleGroundCollison()
{
    isRunning = false;
	reachedGround = true;

    currentPos = {x: range, y: 0};

	savePosition();
}

function updatePosition()
{
	time += deltaTime / 1000;

	currentPos.x = initialSpeed.x * time;
	currentPos.y = initialSpeed.y * time - 0.5 * gravity * time ** 2;
}

function savePosition()
{
	trajectory.push({x: currentPos.x, y: currentPos.y});
}

function updateData()
{
	document.getElementById("range").innerText = `Rango: ${currentPos.x.toFixed(3)}m`;

	if (!reachedMaxHeight)
	{
		document.getElementById("max-height").innerText = `Altura máxima: ${currentPos.y.toFixed(3)}m`;
	}

	if (reachedGround)
	{
		document.getElementById("time").innerText = `Tiempo: ${flightTime.toFixed(3)}s`;
	}
	else
	{
		document.getElementById("time").innerText = `Tiempo: ${time.toFixed(3)}s`;
	}
}

function renderInspectionPoint(point)
{
	push();

	fill(255);
	noStroke();

	ellipse(point.x, point.y, 5 / scaleFactor, 5 / scaleFactor);

	pop();
}

function updateInspectionValues(point)
{
	document.getElementById("inspection-x").innerText = `X: ${point.x.toFixed(3)}m`;
	document.getElementById("inspection-y").innerText = `Y: ${point.y.toFixed(3)}m`;

}

function clearInspectionValues()
{
	document.getElementById("inspection-x").innerText = "X: 0m";
    document.getElementById("inspection-y").innerText = "Y: 0m";
}

function renderMaxHeightPoint()
{
	push();

	fill(255);
	stroke(255, 0, 0);
	strokeWeight(1 / scaleFactor);

	ellipse(pointMaxHeight.x, pointMaxHeight.y, 5 / scaleFactor, 5 / scaleFactor);

	pop();
}



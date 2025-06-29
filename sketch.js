


// Valores de canvas
const canvasWidth = 300;
const canvasHeight = 300;

let scaleFactor;
let scaledMouseX;
let scaledMouseY;

const projectileSize = 10;

// Valores de inspección
const inspectionSensibility = 5;
let inspectionThreshold;

let minDistance;
let closestPoint;

let pointMaxHeightX;
let pointMaxHeightY;


// Valores de simulación
const timeStep = 0.025;

let gravity, initialSpeed, angle;
let xSpeed, ySpeed;
let maxHeight, flightTime, range;

let time;
let xPos, yPos;
let trajectory = [];

let reachedMaxHeight = false;
let isRunning = false;



function setup()
{
	createCanvas(canvasWidth, canvasHeight).parent("panel-canvas");

	frameRate(1200);
}

function draw()
{
	background(50);

	fill(255);
	stroke(255);
	noFill();
	
	translate(0, canvasHeight);
	scale(scaleFactor, -scaleFactor);

	scaledMouseX = mouseX / scaleFactor;
	scaledMouseY = (canvasHeight - mouseY) / scaleFactor;
	minDistance = Infinity;
	closestPoint = null;

	// FUNCIONALIDAD - Trayectoria y punto de inspección.
	beginShape();
	for (let point of trajectory)
	{
		// RENDERIZADO - Trayectoria.
		renderTrajectory(point);
		//
		
		// CÁLCULO - Punto de inspección
		let d = dist(scaledMouseX, scaledMouseY, point.x, point.y) // d = distancia entre el mouse y cada punto de la trayectoria.
		if (d < minDistance)
		{
			minDistance = d;
			closestPoint = point;
		}
		//
	}
	endShape();
	//

	// FUNCIONALIDAD - Inspección.
	if (closestPoint && minDistance <= inspectionThreshold)
	{
		// RENDERIZADO - Punto de inspección y valores de inspección.
		renderInspectionPoint(closestPoint);
		updateInspectionValues(closestPoint);
		//
	}
	else
	{
		clearInspectionValues();
	}
	//
	
	// FUNCIONALIDAD - Altura máxima
	if (!reachedMaxHeight && (maxHeight - yPos) < 0.001)
	{
		saveMaxHeight();
	}
	else if (reachedMaxHeight)
	{
		// RENDERIZADO - Punto de altura máxima
		renderMaxHeightPoint();
		//
	}
	//

	// FUNCIONALIDAD - Proyectil.
	renderProjectile();
	if (isRunning)
	{
		let prevYPos = yPos;

		updatePosition();
		updateData();
		
		if (yPos <= 0 && prevYPos > 0)
		{
			handleGroundCollison();
		}
		else if (yPos > 0);
		{
			savePosition();
		}
	}
	//
}

function simulateTrajectory()
{
	// Se recuperan los valores ingresados por el usuario.
	gravity = parseFloat(document.getElementById("gravity").value);
	initialSpeed = parseFloat(document.getElementById("initial-speed").value);
	angle = parseFloat(document.getElementById("angle").value);
	angle *= Math.PI / 180;

	// Se descompone la velocidad en sus componentes.
	xSpeed = initialSpeed * Math.cos(angle);
	ySpeed = initialSpeed * Math.sin(angle);

	// Se calculan la altura máxima, el tiempo de vuelo y el alcance horizontal
	maxHeight = (ySpeed ** 2) / (gravity * 2);
	flightTime = (ySpeed * 2) / gravity;
	range = (xSpeed * flightTime);

	// Se reestablece el tiempo.
	time = 0;

	// Se reestablece la posición del proyectil.
	xPos = 0;
	yPos = 0;

	// Se crea un arreglo vacío para almacenar las posiciones del proyectil.
	// Cada elemento en dicho arreglo será un objeto con las características x & y.
	trajectory = [];

	// Se ajusta el factor de escala.
	scaleFactor = Math.min(canvasWidth / range, canvasHeight / maxHeight);

	// Se ajusta la sensibilidad del punto de inspección.
	inspectionThreshold = inspectionSensibility / scaleFactor;
	
	// Se reestablecen los valores informativos.
	document.getElementById("max-height").innerText = "Altura máxima: 0";
    document.getElementById("range").innerText = "Rango: 0"
	document.getElementById("inspection-x").innerText = "X: 0";
    document.getElementById("inspection-y").innerText = "Y: 0";
	
	// Se reestablecen las banderas.
	reachedMaxHeight = false;

	// Se inicia la simulación.
	isRunning = true;
}

function renderTrajectory(point)
{
	push();
	
	stroke(255);
	noFill();

	vertex(point.x, point.y);

	pop();	
}

function renderProjectile()
{
	push();
	
	fill(255);
	stroke(0);
	
	ellipse(xPos, yPos, projectileSize / scaleFactor, projectileSize / scaleFactor);

	pop();
}

function handleGroundCollison()
{
    isRunning = false;

    const lastPoint = trajectory[trajectory.length - 1];

    if (!lastPoint || (lastPoint.x.toFixed(2) !== range || lastPoint.y.toFixed(2) !== 0))
	{
        trajectory.push({x: range, y: 0});
    }
   
    xPos = range;
    yPos = 0;
}


function savePosition()
{
	trajectory.push({x: xPos, y: yPos});
}

function updatePosition()
{
	ySpeedPoint = ySpeed - gravity * time;

	time += timeStep;

	xPos = xSpeed * time;
	yPos = ySpeed * time - 0.5 * gravity * time ** 2;
}

function updateData()
{
	if (xPos <= range)
	{
		document.getElementById("range").innerText = `Rango: ${xPos.toFixed(3)}m`
	}
	
	if (!reachedMaxHeight && yPos <= maxHeight)
	{
		document.getElementById("max-height").innerText = `Altura máxima: ${yPos.toFixed(3)}m`
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

function saveMaxHeight()
{
	reachedMaxHeight = true;
	pointMaxHeightX = xPos;
	pointMaxHeightY = yPos;
}

function renderMaxHeightPoint()
{	
	push();

	fill(255);
	stroke(255, 0, 0);
	
	ellipse(pointMaxHeightX, pointMaxHeightY, 5 / scaleFactor, 5 / scaleFactor);

	pop();
}
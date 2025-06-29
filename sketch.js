


const projSize = 10;
const canvasWidth = 500;
const canvasHeight = 700;
let scaleFactor;

const timeStep = 0.025;


let gravity, initialSpeed, angle;
let xSpeed, ySpeed, ySpeedPoint;
let maxHeight, flightTime, range;

let time;
let xPos, yPos;
let trajectory = [];

let inspectionX, inspectionY;

let pointMaxHeightX, pointMaxHeightY;


let isRunning = false;
let isInspectingTrajectory = false;
let reachedMaxHeight = false;
let reachedGround = false;



function setup()
{
	createCanvas(canvasWidth, canvasHeight);

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

	// FUNCIONALIDAD - Trayectoria e inspección de posición.
	beginShape();
	for (let point of trajectory)
	{
		// RENDERIZADO - Trayectoria.
		renderTrajectory(point);
		//
		
		let scaledMouseX = mouseX / scaleFactor;
		let scaledMouseY = (canvasHeight - mouseY) / scaleFactor;

		let d = dist(scaledMouseX, scaledMouseY, point.x, point.y) // d = distancia entre el mouse y cada punto de la trayectoria.
		if (d <= 1)
		{
			// RENDERIZADO - Inspección de posición e infográfico.
				renderInspectionPoint(point);
				updateInspectionValues(point);
			//
		}
		else
		{
			clearInspectionValues();
		}
	}
	endShape();
	//

	// FUNCIONALIDAD - Proyectil
	renderProjectile();
	if (isRunning && yPos >= 0)
	{
		savePosition();
		updateData();
	}
	//

	// FUNCIONALIDAD - Inspección.
	renderInfo();
	//
	
	// FUNCIONALIDAD - "Altura máxima"
	if (!reachedMaxHeight)
	{
		if (ySpeedPoint <= 0)
		{
			saveMaxHeight();
		}
	}
	else
	{
		if (!isInspectingTrajectory)
		{
			renderMaxHeight();
		}

		if (yPos <= 20)
		{
			isRunning = false;
		}
	}
}

function startTrajectory()
{
	// Se recuperan los valores ingresados por el usuario.
	gravity = parseFloat(document.getElementById("gravity").value);
	initialSpeed = parseFloat(document.getElementById("initialSpeed").value);
	angle = parseFloat(document.getElementById("angle").value);
	angle *= Math.PI / 180;

	// Se descompone la velocidad en sus componentes.
	xSpeed = initialSpeed * Math.cos(angle);
	ySpeed = initialSpeed * Math.sin(angle);

	// Se calculan la altura máxima, el tiempo de vuelo y el alcance horizontal
	maxHeight = (ySpeed ** 2) / (2 * gravity);
	flightTime =  (ySpeed * 2) / gravity;
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
	
	// Se reestablecen los valores informativos.
	inspectionX = "0";
	inspectionY = "0";
	pointMaxHeightX = 0;
	pointMaxHeightY = 0;
	
	// Se reestablecen las banderas.
	isInspectingTrajectory = false;
	reachedMaxHeight = false;
	reachedRange = false;

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
	
	ellipse(xPos, yPos, projSize / scaleFactor, projSize / scaleFactor);

	pop();
}

function savePosition()
{
	trajectory.push({x: xPos, y: yPos});
}

function updateData()
{
	ySpeedPoint = ySpeed - gravity * time;

	time += timeStep;

	xPos = xSpeed * time;
	yPos = ySpeed * time - 0.5 * gravity * time ** 2;
}

function renderInfo()
{
	push();

	resetMatrix();
	translate(0, canvasHeight);
	scale(scaleFactor, scaleFactor);

	textSize(12 / scaleFactor);
	textAlign(LEFT, BOTTOM);
	text(`X: ${inspectionX}`, 10, (-1 * canvasHeight) / scaleFactor + 20);
	text(`Y: ${inspectionY}`, 10, (-1 * canvasHeight) / scaleFactor + 30);

	pop();
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
	inspectionX = point.x.toFixed(2).toString();
	inspectionY = point.y.toFixed(2).toString();

	isInspectingTrajectory = true;
}

function clearInspectionValues()
{
	inspectionX = "0";
	inspectionY = "0";
	
	isInspectingTrajectory = false;
}

function saveMaxHeight()
{
	reachedMaxHeight = true;
	pointMaxHeightX = xPos;
	pointMaxHeightY = yPos;
}

function renderMaxHeight()
{	
	push();

	fill(255);
	stroke(255, 0, 0);
	
	ellipse(pointMaxHeightX, pointMaxHeightY, 5 / scaleFactor, 5 / scaleFactor);

	pop();

	push();

	resetMatrix();
	translate(0, canvasHeight);
	scale(scaleFactor, scaleFactor);

	textSize(12 / scaleFactor);
	textAlign(CENTER, BOTTOM);
	text(`Altura máxima: ${maxHeight.toFixed(2)}`, pointMaxHeightX, -1 * pointMaxHeightY - 10);

	pop();
}
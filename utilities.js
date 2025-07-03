


function validateInitialSpeed(input)
{
	if (input.value > 500) input.value = 500;
	if (input.value < 1) input.value = 1;
	return input.value;
}

function validateAngle(input)
{
	if (input.value > 90) input.value = 90;
	if (input.value < 0) input.value = 0;
	return input.value;
}

function toggleSimulation() {
    if (!reachedGround)
	{
		isRunning = !isRunning;
	}
}

function resetPan()
{
	pan = {x: 0, y: 0};
}

function debug_toggleEF()
{
	enableExperimentalFeatures = !enableExperimentalFeatures;
}
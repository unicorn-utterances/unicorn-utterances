/**
 * Evenly dispurse the number of items across a circle going downward from the base of a DIV
 * Calculate the positions in percentages we need to place each item
 *
 * @param numberOfItems The total number of items in the circle
 * @param index The index of the current item in the list (may be floating point)
 * @param offset Degrees to offset the angle by
 */
export function calculatePosition(
	numberOfItems: number,
	index: number,
	offset = 0,
) {
	const angle = Math.abs(
		(((Math.PI * 2) / numberOfItems) * index + offset) % 360,
	);

	const x = Math.cos(angle) * 50 + 50; // Adjusted for horizontal positioning
	const y = Math.sin(angle) * 50 + 50; // Adjusted for vertical positioning

	// Items between 180 and 240 degrees and items between 300 and 360 degrees are scaled down
	// Items between 240 and 300 degrees are scale of 1
	// Items at 0 and 180 degrees are 0

	// Convert angle to degrees, and ensure it's positive and within 0-360 degrees
	const angleDegrees = Math.abs((angle * (180 / Math.PI)) % 360);

	let scale;
	// Determine scale based on angle range
	if (angleDegrees >= 10 && angleDegrees <= 170) {
		scale = 1; // No scaling for items within this range
	} else if (angleDegrees > 170 && angleDegrees <= 180) {
		// Scale down linearly from 120 to 150 degrees to 0
		scale = ((angleDegrees - 180) / (170 - 180)) * (1 - 0) + 0;
	} else if (angleDegrees >= 0 && angleDegrees <= 10) {
		// Scale down linearly from 30 to 60 degrees to 0
		scale = ((angleDegrees - 0) / (10 - 0)) * (1 - 0) + 0;
	} else {
		scale = 0;
	}

	if (scale < 0.7) {
		scale = 0;
	}

	return { x, y, scale };
}

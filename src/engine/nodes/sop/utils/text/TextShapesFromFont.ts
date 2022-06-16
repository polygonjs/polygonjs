import {Shape, Path} from 'three';

export function shapesFromFont(shapes?: Array<Array<Shape>>) {
	// const shapesPerLetter: Array<Array<Shape | Path>> = [];
	// if (shapes) {
	// 	for (let i = 0; i < shapes.length; i++) {
	// 		const shape = shapes[i];
	// 		const shapesForLetter: Array<Shape | Path> = [shape];
	// 		const holeShapes: Path[] = [];
	// 		if (shape.holes && shape.holes.length > 0) {
	// 			for (let j = 0; j < shape.holes.length; j++) {
	// 				const hole = shape.holes[j];
	// 				holeShapes.push(hole);
	// 			}
	// 		}
	// 		shapesForLetter.push(...holeShapes);
	// 		shapesPerLetter.push(shapesForLetter);
	// 	}
	// 	// shapes.push.apply(shapes, holeShapes as Shape[]);
	// }
	// return shapesPerLetter;
	return shapes?.map((shapes) => _shapesForLetter(shapes));
}
function _shapesForLetter(shapes: Array<Shape>) {
	const newShapes: Array<Shape | Path> = [...shapes];
	if (shapes) {
		for (let i = 0; i < shapes.length; i++) {
			const shape = shapes[i];
			const holeShapes: Path[] = [];
			if (shape.holes && shape.holes.length > 0) {
				for (let j = 0; j < shape.holes.length; j++) {
					const hole = shape.holes[j];
					holeShapes.push(hole);
				}
			}
			newShapes.push(...holeShapes);
			// shapesPerLetter.push(shapesForLetter);
		}
		// shapes.push.apply(shapes, holeShapes as Shape[]);
	}
	return newShapes;
}

import {Shape, Path, BufferGeometry, Float32BufferAttribute} from 'three';

interface TextLinesParams {
	curveSegments: number;
	shapes?: Array<Array<Shape | Path>>;
}

export function createGeometriesFromTypeLine(params: TextLinesParams) {
	return params.shapes?.map((shapes) => createGeometryFromTypeLine(params.curveSegments, shapes));
}
function createGeometryFromTypeLine(curveSegments: number, shapes?: Array<Shape | Path>) {
	if (!shapes) {
		return;
	}
	const positions = [];
	const indices = [];
	let currentIndex = 0;

	for (let i = 0; i < shapes.length; i++) {
		const shape = shapes[i];
		const points = shape.getPoints(curveSegments);
		for (let j = 0; j < points.length; j++) {
			const point = points[j];
			positions.push(point.x);
			positions.push(point.y);
			positions.push(0);
			indices.push(currentIndex);
			if (j > 0 && j < points.length - 1) {
				indices.push(currentIndex);
			}
			currentIndex += 1;
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	geometry.setIndex(indices);
	return geometry;
}

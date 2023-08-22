import {Vector2, BufferGeometry, BufferAttribute} from 'three';

const stepSize = new Vector2();
const stepsCount = new Vector2();
export class CoreGeometryOperationHexagon {
	constructor(private _size: Vector2, private _hexagonRadius: number, private _pointsOnly: boolean) {}

	process(): BufferGeometry {
		const sideLength = this._hexagonRadius;
		const halfSideLength = sideLength * 0.5;
		stepSize.set(sideLength, Math.cos(Math.PI / 6) * this._hexagonRadius);
		stepsCount.set(Math.floor(this._size.x / stepSize.x), Math.floor(this._size.y / stepSize.y));
		let positions: number[] = [];
		let indices: number[] = [];
		const addIndices = !this._pointsOnly;
		for (let y = 0; y < stepsCount.y; y++) {
			for (let x = 0; x < stepsCount.x; x++) {
				positions.push(
					-(this._size.x * 0.5) + x * stepSize.x + (y % 2 == 0 ? halfSideLength : 0),
					-(this._size.y * 0.5) + y * stepSize.y,
					0
				);

				if (addIndices) {
					if (y >= 1) {
						if (x == 0 || x == stepsCount.x - 1) {
							if (x == 0) {
								// indices.push(
								// 	x + 1 + (y - 1) * stepsCount.x,
								// 	x + y * stepsCount.x,
								// 	x + (y - 1) * stepsCount.x
								// );
							} else {
								// indices.push(
								// 	x + y * stepsCount.x,
								// 	x - 1 + y * stepsCount.x,
								// 	x + (y - 1) * stepsCount.x
								// );
							}
						} else {
							if (y % 2 == 0) {
								indices.push(
									x + y * stepsCount.x,
									x - 1 + y * stepsCount.x,
									x + (y - 1) * stepsCount.x
								);
								indices.push(
									x + y * stepsCount.x,
									x + (y - 1) * stepsCount.x,
									x + 1 + (y - 1) * stepsCount.x
								);
							} else {
								indices.push(
									x + (y - 1) * stepsCount.x,
									x + y * stepsCount.x,
									x - 1 + (y - 1) * stepsCount.x
								);
								indices.push(
									x + 1 + y * stepsCount.x,
									x + y * stepsCount.x,
									x + (y - 1) * stepsCount.x
								);
							}
						}
					}
				}
			}
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));

		if (addIndices) {
			geometry.setIndex(indices);
			geometry.computeVertexNormals();
		}

		return geometry;
	}
}

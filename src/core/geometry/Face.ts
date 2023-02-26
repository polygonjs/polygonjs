import {AttribValue, NumericAttribValue} from '../../types/GlobalTypes';
import {Vector3} from 'three';
import {Vector2} from 'three';
import {Triangle} from 'three';
import {BufferGeometry} from 'three';
import {BufferAttribute} from 'three';
import {CorePoint} from './Point';
import {CoreGeometry} from './Geometry';
import {CoreMath} from '../math/_Module';
import {ArrayUtils} from '../ArrayUtils';
import {Matrix4} from 'three';

interface FaceLike {
	a: number;
	b: number;
	c: number;
}

type CorePointArray3 = [CorePoint, CorePoint, CorePoint];
type Vector3Array2 = [Vector3, Vector3];
type Vector3Array3 = [Vector3, Vector3, Vector3];

export class CoreFace {
	_geometry: BufferGeometry;
	_points: CorePointArray3 | undefined;
	_triangle: Triangle | undefined;
	_positions: Vector3Array3 | undefined;
	_deltas: Vector3Array2 | undefined;

	constructor(private _coreGeometry: CoreGeometry, private _index: number) {
		this._geometry = this._coreGeometry.geometry();
	}
	index() {
		return this._index;
	}
	points() {
		return (this._points = this._points || this._get_points());
	}
	applyMatrix4(matrix: Matrix4) {
		for (let point of this.points()) {
			point.applyMatrix4(matrix);
		}
	}
	private _get_points(): CorePointArray3 {
		const indexArray = this._geometry.index?.array || [];
		const start = this._index * 3;
		return [
			new CorePoint(this._coreGeometry, indexArray[start + 0]),
			new CorePoint(this._coreGeometry, indexArray[start + 1]),
			new CorePoint(this._coreGeometry, indexArray[start + 2]),
		];
	}
	positions() {
		return (this._positions = this._positions || this._getPositions());
	}
	private _getPositions(): Vector3Array3 {
		const points = this.points();
		return [points[0].position(), points[1].position(), points[2].position()];
	}
	triangle() {
		return (this._triangle = this._triangle || this._get_triangle());
	}
	private _get_triangle(): Triangle {
		const positions = this.positions();
		return new Triangle(positions[0], positions[1], positions[2]);
	}
	deltas() {
		return (this._deltas = this._deltas || this._getDeltas());
	}
	private _getDeltas(): Vector3Array2 {
		const positions = this.positions();
		return [positions[1].clone().sub(positions[0]), positions[2].clone().sub(positions[0])];
	}

	area(): number {
		return this.triangle().getArea();
	}
	center(target: Vector3) {
		const positions = this.positions();
		target.x = (positions[0].x + positions[1].x + positions[2].x) / 3;
		target.y = (positions[0].y + positions[1].y + positions[2].y) / 3;
		target.z = (positions[0].z + positions[1].z + positions[2].z) / 3;

		return target;
	}

	randomPosition(seed: number) {
		let weights = [CoreMath.randFloat(seed), CoreMath.randFloat(seed * 6541)];

		if (weights[0] + weights[1] > 1) {
			weights[0] = 1 - weights[0];
			weights[1] = 1 - weights[1];
		}
		return this.positions()[0]
			.clone()
			.add(this.deltas()[0].clone().multiplyScalar(weights[0]))
			.add(this.deltas()[1].clone().multiplyScalar(weights[1]));
	}
	// random_position(seed: number){
	// 	let weights = [
	// 		CoreMath.rand_float(seed),
	// 		CoreMath.rand_float(seed*524),
	// 		CoreMath.rand_float(seed*4631)
	// 	]
	// 	const sum = ArrayUtils.sum(weights)
	// 	weights = weights.map(w=>w/sum)
	// 	const pos = new Vector3()
	// 	let positions = this.positions().map((p,i)=> p.multiplyScalar(weights[i]))
	// 	positions.forEach(p=>{
	// 		pos.add(p)
	// 	})
	// 	return pos
	// }

	attribValueAtPosition(attrib_name: string, position: Vector3) {
		// const weights = CoreInterpolate._weights_from_3(position, this._positions)
		const barycentricCoordinates = new Vector3();
		this.triangle().getBarycoord(position, barycentricCoordinates);
		const weights = barycentricCoordinates.toArray();

		const attrib = this._geometry.attributes[attrib_name];
		const attribSize = attrib.itemSize;
		const pointValues = this.points().map((point) => point.attribValue(attrib_name));

		let newAttribValue: AttribValue | undefined;
		let sum;
		let index = 0;
		switch (attribSize) {
			case 1: {
				sum = 0;
				for (let pointValue of pointValues as number[]) {
					sum += pointValue * weights[index];
					index++;
				}
				newAttribValue = sum;
				break;
			}
			default: {
				for (let pointValue of pointValues as Vector3[]) {
					const weightedValue = pointValue.multiplyScalar(weights[index]);
					if (sum) {
						sum.add(weightedValue);
					} else {
						sum = weightedValue;
					}
					index++;
				}
				newAttribValue = sum;
			}
		}
		return newAttribValue;
	}

	static interpolatedValue(
		geometry: BufferGeometry,
		face: FaceLike,
		intersectPoint: Vector3,
		attrib: BufferAttribute
	) {
		// let point_index, i, sum
		const pointIndices = [face.a, face.b, face.c];
		const positionAttrib = geometry.getAttribute('position') as BufferAttribute;
		const positionAttribArray = positionAttrib.array;
		const pointPositions = pointIndices.map(
			(point_index) =>
				new Vector3(
					positionAttribArray[point_index * 3 + 0],
					positionAttribArray[point_index * 3 + 1],
					positionAttribArray[point_index * 3 + 2]
				)
		);

		const attribSize = attrib.itemSize;
		const attribArray = attrib.array;
		let attribValues: NumericAttribValue[] = [];
		switch (attribSize) {
			case 1:
				attribValues = pointIndices.map((point_index) => attribArray[point_index]);
				break;
			case 2:
				attribValues = pointIndices.map(
					(point_index) => new Vector2(attribArray[point_index * 2 + 0], attribArray[point_index * 2 + 1])
				);
				break;
			case 3:
				attribValues = pointIndices.map(
					(point_index) =>
						new Vector3(
							attribArray[point_index * 3 + 0],
							attribArray[point_index * 3 + 1],
							attribArray[point_index * 3 + 2]
						)
				);
				break;
		}

		const distToPoints = pointIndices.map((point_index, i) => intersectPoint.distanceTo(pointPositions[i]));

		// https://math.stackexchange.com/questions/1336386/weighted-average-distance-between-3-or-more-points
		// TODO: replace this with Core.Math.Interpolate
		const distanceTotal = ArrayUtils.sum([
			distToPoints[0] * distToPoints[1],
			distToPoints[0] * distToPoints[2],
			distToPoints[1] * distToPoints[2],
		]);

		const weights = [
			(distToPoints[1] * distToPoints[2]) / distanceTotal,
			(distToPoints[0] * distToPoints[2]) / distanceTotal,
			(distToPoints[0] * distToPoints[1]) / distanceTotal,
		];

		let newAttribValue;
		switch (attribSize) {
			case 1:
				newAttribValue = ArrayUtils.sum(
					pointIndices.map((point_indx, i) => weights[i] * (attribValues[i] as number))
				);
				break;
			default:
				var values = pointIndices.map((point_index, i) =>
					(attribValues[i] as Vector3).multiplyScalar(weights[i])
				);
				newAttribValue = null;
				for (let value of values) {
					if (newAttribValue) {
						newAttribValue.add(value);
					} else {
						newAttribValue = value;
					}
				}
		}

		return newAttribValue;
	}
}

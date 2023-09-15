import {AttribValue, Number3, NumericAttribValue} from '../../../../types/GlobalTypes';
import {BufferAttribute, BufferGeometry, Triangle, Vector2, Vector3, Mesh} from 'three';
import {ThreejsPoint} from '../../modules/three/ThreejsPoint';
import {arraySum} from '../../../ArrayUtils';
import {ThreejsPointArray3} from './Common';

interface FaceLike {
	a: number;
	b: number;
	c: number;
}

const dummyMesh = new Mesh();
type Vector3Array2 = [Vector3, Vector3];
type Vector3Array3 = [Vector3, Vector3, Vector3];

const _positions: Vector3Array3 = [new Vector3(), new Vector3(), new Vector3()];
// const _deltas: Vector3Array2 = [new Vector3(), new Vector3()];
const _triangle = new Triangle();
const barycentricCoordinates = new Vector3();
const barycentricCoordinatesArray: Number3 = [0, 0, 0];

export class CoreFace {
	private _geometry?: BufferGeometry;
	private _index: number = 0;
	private _corePoint = new ThreejsPoint(dummyMesh, 0);
	private _points: ThreejsPointArray3 = [
		new ThreejsPoint(dummyMesh, 0),
		new ThreejsPoint(dummyMesh, 0),
		new ThreejsPoint(dummyMesh, 0),
	];
	constructor() {}
	setGeometry(geometry: BufferGeometry) {
		this._geometry = geometry;
		return this;
	}
	setIndex(index: number, geometry?: BufferGeometry) {
		this._index = index;
		if (geometry) {
			this._geometry = geometry;
		}
		return this;
	}
	index() {
		return this._index;
	}
	// points() {
	// 	return (this._points = this._points || this._getPoints());
	// }
	// applyMatrix4(matrix: Matrix4) {
	// 	for (let point of this.points()) {
	// 		point.applyMatrix4(matrix);
	// 	}
	// }
	points(points: ThreejsPointArray3) {
		if (!this._geometry) {
			console.warn('no geometry');
			return;
		}
		const indexArray = this._geometry.index?.array || [];
		const start = this._index * 3;
		dummyMesh.geometry = this._geometry;
		points[0].setIndex(indexArray[start + 0], dummyMesh);
		points[1].setIndex(indexArray[start + 1], dummyMesh);
		points[2].setIndex(indexArray[start + 2], dummyMesh);
	}
	// positions() {
	// 	return (this._positions = this._positions || this._getPositions());
	// }
	positions(target: Vector3Array3): void {
		if (!this._geometry) {
			return;
		}
		dummyMesh.geometry = this._geometry;
		this._corePoint.setIndex(this._index * 3 + 0, dummyMesh).position(target[0]);
		this._corePoint.setIndex(this._index * 3 + 1, dummyMesh).position(target[1]);
		this._corePoint.setIndex(this._index * 3 + 2, dummyMesh).position(target[2]);
	}
	triangle(target: Triangle) {
		this.positions(_positions);
		target.a.copy(_positions[0]);
		target.b.copy(_positions[1]);
		target.c.copy(_positions[2]);
		// return (this._triangle = this._triangle || this._get_triangle());
	}
	// private _get_triangle(target:Triangle): void {
	// 	const positions = this.positions();
	// 	return new Triangle(positions[0], positions[1], positions[2]);
	// }
	deltas(target: Vector3Array2) {
		this.positions(_positions);
		target[0].copy(_positions[1]).sub(_positions[0]);
		target[1].copy(_positions[2]).sub(_positions[0]);
		// positions[1].clone().sub(positions[0]
		// positions[2].clone().sub(positions[0];
		// return (this._deltas = this._deltas || this._getDeltas());
	}
	// private _getDeltas(): Vector3Array2 {
	// 	const positions = this.positions();
	// 	// return [positions[1].clone().sub(positions[0]), positions[2].clone().sub(positions[0])];
	// }

	area(): number {
		this.triangle(_triangle);
		return _triangle.getArea();
	}
	center(target: Vector3) {
		this.positions(_positions);

		target.x = (_positions[0].x + _positions[1].x + _positions[2].x) / 3;
		target.y = (_positions[0].y + _positions[1].y + _positions[2].y) / 3;
		target.z = (_positions[0].z + _positions[1].z + _positions[2].z) / 3;

		return target;
	}

	// randomPosition(seed: number, target: Vector3) {
	// 	let weight0 = CoreMath.randFloat(seed);
	// 	let weight1 = CoreMath.randFloat(seed * 6541);
	// 	// let weights = [, CoreMath.randFloat(seed * 6541)];

	// 	if (weight0 + weight1 > 1) {
	// 		weight0 = 1 - weight0;
	// 		weight1 = 1 - weight1;
	// 	}
	// 	this.positions(_positions);
	// 	this.deltas(_deltas);
	// 	target.copy(_positions[0]).add(_deltas[0].multiplyScalar(weight0)).add(_deltas[1].multiplyScalar(weight1));
	// 	// return [0]
	// 	// 	.clone()
	// 	// 	.add(this.deltas()[0].clone().multiplyScalar(weights[0]))
	// 	// 	.add(this.deltas()[1].clone().multiplyScalar(weights[1]));
	// }
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
		if (!this._geometry) {
			return;
		}
		// const weights = CoreInterpolate._weights_from_3(position, this._positions)

		this.triangle(_triangle);
		_triangle.getBarycoord(position, barycentricCoordinates);
		barycentricCoordinates.toArray(barycentricCoordinatesArray);
		const weights = barycentricCoordinatesArray;

		const attrib = this._geometry.attributes[attrib_name];
		const attribSize = attrib.itemSize;
		this.points(this._points);
		const pointValues = this._points.map((point) => point.attribValue(attrib_name));

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
			(i) =>
				new Vector3(
					positionAttribArray[i * 3 + 0],
					positionAttribArray[i * 3 + 1],
					positionAttribArray[i * 3 + 2]
				)
		);

		const attribSize = attrib.itemSize;
		const attribArray = attrib.array;
		let attribValues: NumericAttribValue[] = [];
		switch (attribSize) {
			case 1:
				attribValues = pointIndices.map((i) => attribArray[i]);
				break;
			case 2:
				attribValues = pointIndices.map((i) => new Vector2(attribArray[i * 2 + 0], attribArray[i * 2 + 1]));
				break;
			case 3:
				attribValues = pointIndices.map(
					(i) => new Vector3(attribArray[i * 3 + 0], attribArray[i * 3 + 1], attribArray[i * 3 + 2])
				);
				break;
		}

		const distToPoints = pointIndices.map((point_index, i) => intersectPoint.distanceTo(pointPositions[i]));

		// https://math.stackexchange.com/questions/1336386/weighted-average-distance-between-3-or-more-points
		// TODO: replace this with Core.Math.Interpolate
		const distanceTotal = arraySum([
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
				newAttribValue = arraySum(
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

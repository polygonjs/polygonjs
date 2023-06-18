/**
 * Creates a box filled with tetrahedrons.
 *
 *
 */
import {TetSopNode} from './_BaseTet';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {TetGeometry} from '../../../core/geometry/tet/TetGeometry';
import {VERTICES_X} from '../../../core/geometry/tet/TetCommon';
import {Number4} from '../../../types/GlobalTypes';
import {Vector3} from 'three';

const _tetOffset = new Vector3();
const _v = new Vector3();
const pointIndices: Number4 = [-1, -1, -1, -1];

const VERTICES_COUNT_X = VERTICES_X.length;
// const VERTICES_COUNT_Y = VERTICES_Y.length;

class TetBoxSopParamsConfig extends NodeParamsConfig {
	/** @param size of the box */
	size = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
	/** @param sizes on each axis */
	sizes = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param number of tetrahedrons on each axis */
	divisions = ParamConfig.VECTOR3([4, 4, 4]);
	/** @param center of the geometry */
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new TetBoxSopParamsConfig();

export class TetBoxSopNode extends TetSopNode<TetBoxSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TET_BOX;
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const geometry = new TetGeometry();

		const {center} = this.pv;
		const scale = 1;

		let verticesIndexX = 0;
		const countX = 7;
		for (let x = 0; x < countX; x++) {
			// let countY = 1;
			// switch (x) {
			// 	case 0: {
			// 		countY = 2;
			// 		break;
			// 	}
			// 	case 1: {
			// 		countY = 1;
			// 		break;
			// 	}
			// }
			// for (let y = 0; y < countY; y++) {
			_tetOffset.set(x * scale, 0, 0);
			const vertices = VERTICES_X[verticesIndexX];
			console.log('vertices', verticesIndexX, vertices);
			let i = 0;
			for (let v of vertices) {
				_v.copy(v).multiplyScalar(scale).add(_tetOffset).add(center);
				pointIndices[i] = geometry.addPoint(_v.x, _v.y, _v.z);
				i++;
			}
			geometry.addTetrahedron(pointIndices[0], pointIndices[1], pointIndices[2], pointIndices[3]);
			verticesIndexX++;
			if (verticesIndexX >= VERTICES_COUNT_X) {
				verticesIndexX = 0;
			}
			// }
		}

		// let verticesIndexY = 1;
		// const count = 7;
		// for (let y = 1; y < count; y++) {
		// 	_v.set(0, y * scale, 0);
		// 	let i = 0;
		// 	const vertices = VERTICES_Y[verticesIndexY];
		// 	console.log('vertices', VERTICES_COUNT_Y, vertices);
		// 	for (let v of vertices) {
		// 		pointIndices[i] = geometry.addPoint(v.clone().multiplyScalar(scale).add(_v).add(center));
		// 		i++;
		// 	}
		// 	geometry.addTetrahedron(pointIndices);
		// 	verticesIndexY++;
		// 	if (verticesIndexY >= VERTICES_COUNT_Y) {
		// 		verticesIndexY = 0;
		// 	}
		// }

		this.setTetGeometries([geometry]);
	}
}

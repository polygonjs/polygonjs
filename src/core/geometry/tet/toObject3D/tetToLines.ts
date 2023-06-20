import {TetGeometry} from '../TetGeometry';
import {TetTesselationParams} from '../TetCommon';
import {BufferGeometry, Color, Float32BufferAttribute, Vector3} from 'three';
import {ObjectType} from '../../Constant';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {tetCenter} from '../utils/tetCenter';
import {tetMaterialLine} from '../TetMaterial';
import {rand} from '../../../math/_Module';

const _center = new Vector3();
const _p = new Vector3();
const _color = new Color();

export function tetToLines(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	const {scale} = tesselationParams;
	const {points, tetrahedrons} = tetGeometry;
	const lastAddedTetId = tetGeometry.lastAddedTetId();

	const newGeometry = new BufferGeometry();
	const positions: number[] = new Array(tetGeometry.tetsCount() * 4 * 3); // 4 points per tetrahedron, 3 coordinates per point
	const colors: number[] = new Array(tetGeometry.tetsCount() * 4 * 3); // 4 points per tetrahedron, 3 coordinates per point
	const indices: number[] = new Array(tetGeometry.tetsCount() * 6 * 2); // 6 lines per tetrahedron, 2 indices per line

	let positionsCount = 0;
	let indicesCount = 0;
	let indexCount = 0;
	tetrahedrons.forEach((tet) => {
		tetCenter(tetGeometry, tet.id, _center);
		const h = rand(tet.id);
		_color.setHSL(h, lastAddedTetId == tet.id ? 0.1 : 1, lastAddedTetId == tet.id ? 1 : 0.5);

		// line 0
		indices[indicesCount] = indexCount;
		indices[indicesCount + 1] = indexCount + 1;
		// line 1
		indices[indicesCount + 2] = indexCount;
		indices[indicesCount + 3] = indexCount + 2;
		// line 2
		indices[indicesCount + 4] = indexCount;
		indices[indicesCount + 5] = indexCount + 3;
		// line 3
		indices[indicesCount + 6] = indexCount + 1;
		indices[indicesCount + 7] = indexCount + 2;
		// line 4
		indices[indicesCount + 8] = indexCount + 1;
		indices[indicesCount + 9] = indexCount + 3;
		// line 5
		indices[indicesCount + 10] = indexCount + 2;
		indices[indicesCount + 11] = indexCount + 3;

		for (let i = 0; i < 4; i++) {
			const pointId = tet.pointIds[i];
			const point = points.get(pointId);
			if (point) {
				_p.copy(point.position).sub(_center).multiplyScalar(scale).add(_center);
				_p.toArray(positions, positionsCount);
				_color.toArray(colors, positionsCount);

				positionsCount += 3;
			}
		}

		//
		indicesCount += 12;
		indexCount += 4;
	});

	newGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	newGeometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
	newGeometry.setIndex(indices);
	return BaseSopOperation.createObject(newGeometry, ObjectType.LINE_SEGMENTS, tetMaterialLine());
}

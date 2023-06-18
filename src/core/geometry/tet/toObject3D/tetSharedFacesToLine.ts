import {TetGeometry} from '../TetGeometry';
import {TetTesselationParams} from '../TetCommon';
import {BufferGeometry, Float32BufferAttribute, Vector3} from 'three';
import {ObjectType} from '../../Constant';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {tetCenter} from '../utils/tetCenter';

const _center0 = new Vector3();
const _center1 = new Vector3();

export function tetSharedFacesToLines(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	let facesCount = 0;
	tetGeometry.faces.forEach((face) => {
		if (face[0] != -1 && face[1] != -1) {
			facesCount++;
		}
	});
	console.log({facesCount});

	const newGeometry = new BufferGeometry();
	const positions: number[] = new Array(facesCount * 2 * 3); // 2 points per line, 3 coordinates per point
	const indices: number[] = new Array(facesCount * 1 * 2); // 1 line per face, 2 indices per line

	let positionsCount = 0;
	let indicesCount = 0;
	let indexCount = 0;
	tetGeometry.faces.forEach((face) => {
		if (face[0] != -1 && face[1] != -1) {
			facesCount++;
			tetCenter(tetGeometry, face[0], _center0);
			tetCenter(tetGeometry, face[1], _center1);

			// line 0
			indices[indicesCount] = indexCount;
			indices[indicesCount + 1] = indexCount + 1;

			// pt0
			_center0.toArray(positions, positionsCount);
			positionsCount += 3;

			// pt1
			_center1.toArray(positions, positionsCount);
			positionsCount += 3;

			//
			indicesCount += 2;
			indexCount += 2;
		}
	});

	newGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	newGeometry.setIndex(indices);
	console.log(newGeometry);
	return BaseSopOperation.createObject(newGeometry, ObjectType.LINE_SEGMENTS);
}

import {TetGeometry} from '../TetGeometry';
import {TetTesselationParams} from '../TetCommon';
import {BufferGeometry, Float32BufferAttribute, Vector3} from 'three';
import {ObjectType} from '../../Constant';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {tetCenter} from '../utils/tetCenter';

const _center0 = new Vector3();
const _center1 = new Vector3();

const idPairs: Map<number, Set<number>> = new Map();

export function tetSharedFacesToLines(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	idPairs.clear();
	let facesCount = 0;
	tetGeometry.tetrahedrons.forEach((tet) => {
		for (let i = 0; i < 4; i++) {
			const neighbour = tet.neighbours[i];
			if (neighbour != null) {
				const neighbourId = neighbour.id;
				const neighbourTet = tetGeometry.tetrahedrons.get(neighbourId);
				if (neighbourTet) {
					const key = tet.id < neighbourId ? tet.id : neighbourId;
					const value = tet.id < neighbourId ? neighbourId : tet.id;
					let set = idPairs.get(key);
					if (!set) {
						set = new Set();
						idPairs.set(key, set);
					}
					if (!set.has(value)) {
						facesCount++;
					}
					set.add(value);
				}
			}
		}
	});
	// tetGeometry.faces.forEach((face) => {
	// 	if (face[0] != null && face[1] != null) {
	// 		facesCount++;
	// 	}
	// });

	const newGeometry = new BufferGeometry();
	const positions: number[] = new Array(facesCount * 2 * 3); // 2 points per line, 3 coordinates per point
	const indices: number[] = new Array(facesCount * 1 * 2); // 1 line per face, 2 indices per line

	let positionsCount = 0;
	let indicesCount = 0;
	let indexCount = 0;
	idPairs.forEach((neighbourIds, tetId) => {
		neighbourIds.forEach((neighbourId) => {
			tetCenter(tetGeometry, tetId, _center0);
			tetCenter(tetGeometry, neighbourId, _center1);

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
		});
	});
	// 	if (face[0] != null && face[1] != null) {
	// 		facesCount++;

	// 	}
	// });

	newGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	newGeometry.setIndex(indices);
	return BaseSopOperation.createObject(newGeometry, ObjectType.LINE_SEGMENTS);
}

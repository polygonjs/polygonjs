import {Object3D, Vector3} from 'three';
import {TileCorners, TileRotation} from './WFCCommon';
import {Vector3_8, cubeLatticeDeform} from '../geometry/operation/CubeLatticeDeform';

const cubeLatticeDeformPoints: Vector3_8 = [
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
];
const offset = new Vector3(0.5, 0.5, 0.5);
export function tileCubeLatticeDeform(object: Object3D, tileCorners: TileCorners, rotation: TileRotation) {
	switch (rotation) {
		case 0: {
			cubeLatticeDeformPoints[0].copy(tileCorners.p0);
			cubeLatticeDeformPoints[1].copy(tileCorners.p1);
			cubeLatticeDeformPoints[2].copy(tileCorners.p2);
			cubeLatticeDeformPoints[3].copy(tileCorners.p3);
			break;
		}
		case 1: {
			cubeLatticeDeformPoints[0].copy(tileCorners.p3);
			cubeLatticeDeformPoints[1].copy(tileCorners.p0);
			cubeLatticeDeformPoints[2].copy(tileCorners.p1);
			cubeLatticeDeformPoints[3].copy(tileCorners.p2);
			break;
		}
		case 2: {
			cubeLatticeDeformPoints[0].copy(tileCorners.p2);
			cubeLatticeDeformPoints[1].copy(tileCorners.p3);
			cubeLatticeDeformPoints[2].copy(tileCorners.p0);
			cubeLatticeDeformPoints[3].copy(tileCorners.p1);
			break;
		}
		case 3: {
			cubeLatticeDeformPoints[0].copy(tileCorners.p1);
			cubeLatticeDeformPoints[1].copy(tileCorners.p2);
			cubeLatticeDeformPoints[2].copy(tileCorners.p3);
			cubeLatticeDeformPoints[3].copy(tileCorners.p0);

			break;
		}
	}

	cubeLatticeDeformPoints[4].copy(cubeLatticeDeformPoints[0]);
	cubeLatticeDeformPoints[5].copy(cubeLatticeDeformPoints[1]);
	cubeLatticeDeformPoints[6].copy(cubeLatticeDeformPoints[2]);
	cubeLatticeDeformPoints[7].copy(cubeLatticeDeformPoints[3]);
	cubeLatticeDeformPoints[4].y += tileCorners.height;
	cubeLatticeDeformPoints[5].y += tileCorners.height;
	cubeLatticeDeformPoints[6].y += tileCorners.height;
	cubeLatticeDeformPoints[7].y += tileCorners.height;

	cubeLatticeDeform(object, cubeLatticeDeformPoints, {offset, moveObjectPosition: true});
}

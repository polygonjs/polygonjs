import {Object3D, Vector3} from 'three';
import {TileCorners} from './WFCCommon';
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
export function tileCubeLatticeDeform(object: Object3D, tileCorners: TileCorners) {
	cubeLatticeDeformPoints[0].copy(tileCorners.p0);
	cubeLatticeDeformPoints[1].copy(tileCorners.p1);
	cubeLatticeDeformPoints[2].copy(tileCorners.p2);
	cubeLatticeDeformPoints[3].copy(tileCorners.p3);

	cubeLatticeDeformPoints[4].copy(tileCorners.p0);
	cubeLatticeDeformPoints[5].copy(tileCorners.p1);
	cubeLatticeDeformPoints[6].copy(tileCorners.p2);
	cubeLatticeDeformPoints[7].copy(tileCorners.p3);
	cubeLatticeDeformPoints[4].y += tileCorners.height;
	cubeLatticeDeformPoints[5].y += tileCorners.height;
	cubeLatticeDeformPoints[6].y += tileCorners.height;
	cubeLatticeDeformPoints[7].y += tileCorners.height;

	cubeLatticeDeform(object, cubeLatticeDeformPoints, offset);
}

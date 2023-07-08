// SDFContext RayMarch(vec3 ro, vec3 rd, float side) {
// 	SDFContext dO = SDFContext(0.,0,0,0,0.);

// 	#pragma unroll_loop_start
// 	for(int i=0; i<MAX_STEPS; i++) {
// 		vec3 p = ro + rd*dO.d;
// 		SDFContext sdfContext = GetDist(p);
// 		dO.d += sdfContext.d * side;
// 		#if defined( DEBUG_STEPS_COUNT )
// 			dO.stepsCount += 1;
// 		#endif
// 		dO.matId = sdfContext.matId;
// 		dO.matId2 = sdfContext.matId2;
// 		dO.matBlend = sdfContext.matBlend;
// 		if(dO.d>MAX_DIST || abs(sdfContext.d)<SURF_DIST) break;
// 	}
// 	#pragma unroll_loop_end

// 	return dO;
// }
import {Vector3} from 'three';

type DistanceFunction = (position: Vector3) => number;
const _p = new Vector3();
const _d = new Vector3();
const _vn = new Vector3();
const _vn2 = new Vector3();

const MAX_STEPS = 100;
const SURF_DIST = 0.01;
export function softBodyRayMarch(
	origin: Vector3,
	dir: Vector3,
	maxDist: number,
	distanceFunction: DistanceFunction
): number {
	let totalDist = 0;
	_p.copy(origin);
	_vn.copy(dir).normalize();
	_p.add(_vn2.copy(_vn).multiplyScalar(1 * SURF_DIST));
	for (let i = 0; i < MAX_STEPS; i++) {
		const dist = distanceFunction(_p);
		totalDist += dist;
		if (dist < SURF_DIST || totalDist > maxDist) {
			break;
		}
		_d.copy(_vn).multiplyScalar(dist);
		_p.add(_d);
	}
	return totalDist;
}

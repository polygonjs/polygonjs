// /**
//  * Creates Polyhedrons.
//  *
//  *
//  */
// import {TypedCsgNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
// import type {maths} from '@jscad/modeling';
// import {primitives} from '@jscad/modeling';
// import {csgVec3sToJSON} from '../../../core/geometry/csg/math/CsgMathVec3';
// const {polyhedron} = primitives;

// const DEFAULT_POINTS: maths.vec3.Vec3[] = [
// 	[-1, -1, -1],
// 	[-1, -1, 1],
// 	[1, 1, 1],
// 	[1, 1, -1],
// ];
// const DEFAULT_FACES: Array<Array<number>> = [[0, 1, 2, 3]];

// class PolyhedronCsgParamsConfig extends NodeParamsConfig {
// 	/** @param points */
// 	points = ParamConfig.STRING(JSON.stringify(csgVec3sToJSON(DEFAULT_POINTS)));
// 	/** @param paths */
// 	faces = ParamConfig.STRING(JSON.stringify(DEFAULT_FACES));
// 	/** @param outward */
// 	outward = ParamConfig.BOOLEAN(1);
// }
// const ParamsConfig = new PolyhedronCsgParamsConfig();

// export class PolyhedronCsgNode extends TypedCsgNode<PolyhedronCsgParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'polyhedron';
// 	}

// 	override cook(inputCoreGroups: CsgCoreGroup[]) {
// 		try {
// 			const points = JSON.parse(this.pv.points);
// 			const faces = JSON.parse(this.pv.faces);
// 			const geo = polyhedron({
// 				points,
// 				faces,
// 				orientation: this.pv.outward ? 'outward' : 'inward',
// 			});
// 			this.setCsgCoreObject(geo);
// 		} catch (err) {
// 			const message = err instanceof Error ? err.message : 'failed to create geometry';
// 			this.states.error.set(message);
// 			this.setCsgCoreObjects([]);
// 		}
// 	}
// }

// /**
//  * Smoothes an SDF.
//  *
//  *
//  */

// import {SDFSopNode} from './_BaseSDF';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {step} from '../../../core/geometry/modules/cad/CadConstant';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {SDFObject} from '../../../core/geometry/modules/sdf/SDFObject';
// import {SDFLoaderSync} from '../../../core/geometry/modules/sdf/SDFLoaderSync';
// import {Smoothness} from '../../../core/geometry/modules/sdf/SDFCommon';

// class SDFSmoothSopParamsConfig extends NodeParamsConfig {
// 	/** @param smooth */
// 	smooth = ParamConfig.FLOAT(1, {
// 		range: [0, 1],
// 		rangeLocked: [true, false],
// 		step,
// 	});
// }
// const ParamsConfig = new SDFSmoothSopParamsConfig();

// export class SDFSmoothSopNode extends SDFSopNode<SDFSmoothSopParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.SDF_SMOOTH;
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}
// 	override async cook(inputCoreGroups: CoreGroup[]) {
// 		const coreGroup = inputCoreGroups[0];
// 		const newObjects: SDFObject[] = [];
// 		const inputObjects = coreGroup.SDFObjects();
// 		if (inputObjects) {
// 			const manifold = SDFLoaderSync.manifold();
// 			const smoothness = this.pv.smooth;
// 			for (let object of inputObjects) {
// 				const mesh = object.SDFGeometry().getMesh();
// 				const trisCount: number = mesh.numTri;
// 				const halfEdgesCount = trisCount * 3;
// 				console.log({triVerts: mesh.triVerts, trisCount, halfEdgesCount});
// 				const halfEdges: Smoothness[] = new Array(halfEdgesCount);
// 				for (let i = 0; i < trisCount; i++) {
// 					halfEdges[3 * i + 0] = {halfedge: 3 * i + 0, smoothness};
// 					halfEdges[3 * i + 1] = {halfedge: 3 * i + 1, smoothness};
// 					halfEdges[3 * i + 2] = {halfedge: 3 * i + 2, smoothness};
// 				}
// 				console.log(halfEdges);
// 				const smoothed = manifold.smooth(mesh, halfEdges);
// 				const newObject = new SDFObject(smoothed);
// 				newObjects.push(newObject);
// 			}
// 		}

// 		this.setSDFObjects(newObjects);
// 	}
// }

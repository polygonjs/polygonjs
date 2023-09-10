// /**
//  * Extrudes an SDF.
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

// class SDFExtrudeSopParamsConfig extends NodeParamsConfig {
// 	/** @param height */
// 	height = ParamConfig.FLOAT(1, {
// 		range: [0, 1],
// 		rangeLocked: [true, false],
// 		step,
// 	});
// }
// const ParamsConfig = new SDFExtrudeSopParamsConfig();

// export class SDFExtrudeSopNode extends SDFSopNode<SDFExtrudeSopParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.SDF_EXTRUDE;
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
// 			const height = this.pv.height;
// 			for (let object of inputObjects) {
// 				manifold.extrude()
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

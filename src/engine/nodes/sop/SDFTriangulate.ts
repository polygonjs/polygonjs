// /**
//  * Converts input SDF objects to polygon.
//  *
//  *
//  */

// import {SDFSopNode} from './_BaseSDF';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {Object3D} from 'three';
// import {CoreType} from '../../../core/Type';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {SOPSDFTesselationParamConfig} from '../../../core/geometry/modules/sdf/utils/TesselationParamsConfig';
// class SDFriangulateSopParamsConfig extends SOPSDFTesselationParamConfig(NodeParamsConfig) {}
// const ParamsConfig = new SDFriangulateSopParamsConfig();

// export class SDFTriangulateSopNode extends SDFSopNode<SDFriangulateSopParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.SDF_TRIANGULATE;
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	override async cook(inputCoreGroups: CoreGroup[]) {
// 		const sdfObjects = inputCoreGroups[0].SDFObjects();
// 		if (sdfObjects) {
// 			const newObjects: Object3D[] = [];
// 			for (let sdfObject of sdfObjects) {
// 				const objects = sdfObject.toObject3D(this.pv);
// 				if (objects) {
// 					if (CoreType.isArray(objects)) {
// 						newObjects.push(...objects);
// 					} else {
// 						newObjects.push(objects);
// 					}
// 				}
// 			}
// 			this.setObjects(newObjects);
// 		} else {
// 			this.setObjects([]);
// 		}
// 	}
// }

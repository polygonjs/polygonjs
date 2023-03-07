/**
 * Converts input CAD objects to polygon.
 *
 *
 */

import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D} from 'three';
import {CoreType} from '../../../core/Type';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {SOPCADTesselationParamConfig} from '../../../core/geometry/cad/utils/TesselationParamsConfig';
class CADTriangulateSopParamsConfig extends SOPCADTesselationParamConfig(NodeParamsConfig) {}
const ParamsConfig = new CADTriangulateSopParamsConfig();

export class CADTriangulateSopNode extends CADSopNode<CADTriangulateSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_TRIANGULATE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const cadObjects = inputCoreGroups[0].cadObjects();
		if (cadObjects) {
			const newObjects: Object3D[] = [];
			for (let cadObject of cadObjects) {
				const objects = cadObject.toObject3D(this.pv);
				if (objects) {
					if (CoreType.isArray(objects)) {
						newObjects.push(...objects);
					} else {
						newObjects.push(objects);
					}
				}
			}
			this.setObjects(newObjects);
		} else {
			this.setObjects([]);
		}
	}
}

/**
 * Converts input CSG objects to polygon.
 *
 *
 */

import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D} from 'three';
import {CoreType} from '../../../core/Type';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {SOPCSGTesselationParamConfig} from '../../../core/geometry/modules/csg/utils/TesselationParamsConfig';
class CSGTriangulateSopParamsConfig extends SOPCSGTesselationParamConfig(NodeParamsConfig) {}
const ParamsConfig = new CSGTriangulateSopParamsConfig();

export class CSGTriangulateSopNode extends CSGSopNode<CSGTriangulateSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_TRIANGULATE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const csgObjects = inputCoreGroups[0].csgObjects();
		if (csgObjects) {
			const newObjects: Object3D[] = [];
			for (const cadObject of csgObjects) {
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

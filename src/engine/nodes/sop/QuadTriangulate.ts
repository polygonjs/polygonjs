/**
 * Converts input QUAD objects to polygon.
 *
 *
 */

import {QuadSopNode} from './_BaseQuad';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D} from 'three';
import {CoreType} from '../../../core/Type';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {SOPQUADTesselationParamConfig} from '../../../core/geometry/modules/quad/utils/TesselationParamsConfig';
class QuadTriangulateSopParamsConfig extends SOPQUADTesselationParamConfig(NodeParamsConfig) {}
const ParamsConfig = new QuadTriangulateSopParamsConfig();

export class QuadTriangulateSopNode extends QuadSopNode<QuadTriangulateSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUAD_TRIANGULATE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const quadObjects = inputCoreGroups[0].quadObjects();
		if (quadObjects) {
			const newObjects: Object3D[] = [];
			for (const quadObject of quadObjects) {
				const objects = quadObject.toObject3D(this.pv);
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

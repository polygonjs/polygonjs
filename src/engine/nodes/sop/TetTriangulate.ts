/**
 * Converts input TET objects to polygon.
 *
 *
 */

import {TetSopNode} from './_BaseTet';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D} from 'three';
import {isArray} from '../../../core/Type';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {SOPTetTesselationParamConfig} from '../../../core/geometry/modules/tet/utils/TesselationParamsConfig';
class TetTriangulateSopParamsConfig extends SOPTetTesselationParamConfig(NodeParamsConfig) {}
const ParamsConfig = new TetTriangulateSopParamsConfig();

export class TetTriangulateSopNode extends TetSopNode<TetTriangulateSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TET_TRIANGULATE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const tetObjects = inputCoreGroups[0].tetObjects();
		if (tetObjects) {
			const newObjects: Object3D[] = [];
			for (const tetObject of tetObjects) {
				const objects = tetObject.toObject3D(this.pv);
				if (objects) {
					if (isArray(objects)) {
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

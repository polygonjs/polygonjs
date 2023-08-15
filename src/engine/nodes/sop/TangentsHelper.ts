/**
 * Helps checking the tangents of a geometry
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {VertexTangentsHelper} from 'three/examples/jsm/helpers/VertexTangentsHelper';
import {isBooleanTrue} from '../../../core/Type';
import {Mesh, Object3D} from 'three';
import {CoreMask} from '../../../core/geometry/Mask';
import {object3DHasGeometry} from '../../../core/geometry/GeometryUtils';
import {SopType} from '../../poly/registers/nodes/types/Sop';

class TangentsHelperSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param keep input */
	keepInput = ParamConfig.BOOLEAN(1);
	/** @param size of the box */
	size = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new TangentsHelperSopParamsConfig();

export class TangentsHelperSopNode extends TypedSopNode<TangentsHelperSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TANGENTS_HELPER;
	}

	override initializeNode() {
		this.io.outputs.setHasNoOutput();
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const selectedObjects = CoreMask.filterThreejsObjects(inputCoreGroup, this.pv).filter(object3DHasGeometry);
		const newObjects: Object3D[] = [];
		for (let object of selectedObjects) {
			const geometry = (object as Mesh).geometry;
			if (geometry) {
				const tangentAttribute = geometry.getAttribute('tangent');
				if (!tangentAttribute) {
					this.states.error.set(`no tangent attribute found on geometry '${object.name}'`);
					return;
				} else {
					const helper = new VertexTangentsHelper(object, this.pv.size);
					if (isBooleanTrue(this.pv.keepInput)) {
						newObjects.push(object);
					}
					newObjects.push(helper);
				}
			}
		}
		this.setObjects(newObjects);
	}
}

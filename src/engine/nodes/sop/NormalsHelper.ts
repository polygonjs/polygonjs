/**
 * Helps checking the normals of a geometry
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {VertexNormalsHelper} from 'three/examples/jsm/helpers/VertexNormalsHelper';
import {isBooleanTrue} from '../../../core/Type';
import {Object3D} from 'three';
import {CoreMask} from '../../../core/geometry/Mask';
import {object3DHasGeometry} from '../../../core/geometry/GeometryUtils';

class NormalsHelperSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param applyToChildren */
	applyToChildren = ParamConfig.BOOLEAN(true, {separatorAfter: true});
	/** @param keep input */
	keepInput = ParamConfig.BOOLEAN(1);
	/** @param size of the box */
	size = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new NormalsHelperSopParamsConfig();

export class NormalsHelperSopNode extends TypedSopNode<NormalsHelperSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'normalsHelper';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to view normals of'];
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
			const helper = new VertexNormalsHelper(object, this.pv.size);
			if (isBooleanTrue(this.pv.keepInput)) {
				newObjects.push(object);
			}
			newObjects.push(helper);
		}
		this.setObjects(newObjects);
	}
}

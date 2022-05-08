/**
 * Helps checking the normals of a geometry
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {VertexNormalsHelper} from '../../../modules/three/examples/jsm/helpers/VertexNormalsHelper';
import {isBooleanTrue} from '../../../core/Type';
import {Object3D} from 'three';

class NormalsHelperSopParamsConfig extends NodeParamsConfig {
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
		const objects = inputCoreGroup.objectsWithGeo();
		const newObjects: Object3D[] = [];
		for (let object of objects) {
			const helper = new VertexNormalsHelper(object, this.pv.size);
			if (isBooleanTrue(this.pv.keepInput)) {
				newObjects.push(object);
			}
			newObjects.push(helper);
		}
		this.setObjects(newObjects);
	}
}

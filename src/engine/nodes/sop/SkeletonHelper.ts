/**
 * Helps checking the normals of a geometry
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SkeletonHelper} from 'three';
import {Object3D} from 'three';

class SkeletonHelperSopParamsConfig extends NodeParamsConfig {
	// no keepInput param for now, as there seems to be a bug
	// where if the input is not kept, the skeleton does not display immediately.
	// It would only display if the input node is set its display flag first
	// keepInput = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SkeletonHelperSopParamsConfig();

export class SkeletonHelperSopNode extends TypedSopNode<SkeletonHelperSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'skeletonHelper';
	}

	static override displayedInputNames(): string[] {
		return ['objects to add a skeletonHelper to'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];
		const objects = inputCoreGroup.threejsObjects();
		const newObjects: Object3D[] = [];
		for (let object of objects) {
			const helper = new SkeletonHelper(object);
			newObjects.push(object);
			newObjects.push(helper);
		}
		this.setObjects(newObjects);
	}
}

/**
 * Copies the transform from one set of objects to another
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D} from 'three';
import {NodeContext} from '../../poly/NodeContext';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
class TransformCopySopParamConfig extends NodeParamsConfig {
	/** @param toggle on if the second input should be used */
	useSecondInput = ParamConfig.BOOLEAN(1);
	/** @param use a reference object */
	reference = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
		visibleIf: {useSecondInput: 0},
	});
}
const ParamsConfig = new TransformCopySopParamConfig();

export class TransformCopySopNode extends TypedSopNode<TransformCopySopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'transformCopy';
	}

	static override displayedInputNames(): string[] {
		return ['objects to transform', 'objects to copy transform from'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	override cook(input_contents: CoreGroup[]) {
		if (isBooleanTrue(this.pv.useSecondInput) && input_contents[1]) {
			this._copy_from_src_objects(input_contents[0].threejsObjects(), input_contents[1].threejsObjects());
		} else {
			this._copy_from_found_node(input_contents[0].threejsObjects());
		}
	}

	private _copy_from_src_objects(target_objects: Object3D[], src_objects: Object3D[]) {
		let target_object: Object3D;
		let src_object: Object3D;
		for (let i = 0; i < target_objects.length; i++) {
			target_object = target_objects[i];
			src_object = src_objects[i];
			// target_object.position.copy(src_object.position);
			// target_object.quaternion.copy(src_object.quaternion);
			// target_object.scale.copy(src_object.scale);
			src_object.updateMatrix();
			target_object.matrix.copy(src_object.matrix);
			target_object.matrix.decompose(target_object.position, target_object.quaternion, target_object.scale);
		}

		this.setObjects(target_objects);
	}
	private async _copy_from_found_node(target_objects: Object3D[]) {
		const node = this.pv.reference.nodeWithContext(NodeContext.SOP, this.states.error);
		if (node) {
			const container = await node.compute();
			const core_group = container.coreContent();
			if (core_group) {
				const src_objects = core_group.threejsObjects();
				this._copy_from_src_objects(target_objects, src_objects);
				return;
			}
		}

		this.setObjects(target_objects);
	}
}

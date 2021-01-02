/**
 * Copies the transform from one set of objects to another
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D} from 'three/src/core/Object3D';
import {NodeContext} from '../../poly/NodeContext';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class TransformCopySopParamConfig extends NodeParamsConfig {
	/** @param toggle on if the second input should be used */
	useSecondInput = ParamConfig.BOOLEAN(1);
	/** @param use a reference object */
	reference = ParamConfig.OPERATOR_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
		visibleIf: {useSecondInput: 0},
	});
}
const ParamsConfig = new TransformCopySopParamConfig();

export class TransformCopySopNode extends TypedSopNode<TransformCopySopParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'transformCopy';
	}

	static displayed_input_names(): string[] {
		return ['objects to transform', 'objects to copy transform from'];
	}

	initialize_node() {
		this.io.inputs.set_count(1, 2);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	cook(input_contents: CoreGroup[]) {
		if (this.pv.useSecondInput == true && input_contents[1]) {
			this._copy_from_src_objects(input_contents[0].objects(), input_contents[1].objects());
		} else {
			this._copy_from_found_node(input_contents[0].objects());
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
		const node = this.p.reference.found_node_with_context(NodeContext.SOP);
		if (node) {
			const container = await node.requestContainer();
			const core_group = container.coreContent();
			if (core_group) {
				const src_objects = core_group.objects();
				this._copy_from_src_objects(target_objects, src_objects);
				return;
			}
		}

		this.setObjects(target_objects);
	}
}

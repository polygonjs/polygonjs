import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D} from 'three/src/core/Object3D';
import {NodeContext} from '../../poly/NodeContext';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class TransformCopySopParamConfig extends NodeParamsConfig {
	use_second_input = ParamConfig.BOOLEAN(1);
	reference = ParamConfig.OPERATOR_PATH('', {
		node_selection: {
			context: NodeContext.SOP,
		},
		visible_if: {use_second_input: 0},
	});
}
const ParamsConfig = new TransformCopySopParamConfig();

export class TransformCopySopNode extends TypedSopNode<TransformCopySopParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'transform_copy';
	}

	static displayed_input_names(): string[] {
		return ['objects to transform', 'objects to copy transform from'];
	}

	initialize_node() {
		this.io.inputs.set_count(1, 2);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	cook(input_contents: CoreGroup[]) {
		if (this.pv.use_second_input == true && input_contents[1]) {
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
			target_object.position.copy(src_object.position);
			target_object.quaternion.copy(src_object.quaternion);
			target_object.scale.copy(src_object.scale);
		}

		this.set_objects(target_objects);
	}
	private async _copy_from_found_node(target_objects: Object3D[]) {
		const node = this.p.reference.found_node_with_context(NodeContext.SOP);
		if (node) {
			const container = await node.request_container();
			const core_group = container.core_content();
			if (core_group) {
				const src_objects = core_group.objects();
				this._copy_from_src_objects(target_objects, src_objects);
				return;
			}
		}

		this.set_objects(target_objects);
	}
}

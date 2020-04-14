import {NodeParamsConfig} from '../../utils/params/ParamsConfig';
import {TypedObjNode, BaseObjNodeType} from '../_Base';
import {Object3D} from 'three/src/core/Object3D';

class HierarchyParamsConfig extends NodeParamsConfig {}
export class HierarchyObjNode extends TypedObjNode<Object3D, HierarchyParamsConfig> {
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);
}

export class HierarchyController {
	constructor(private node: HierarchyObjNode) {}

	initialize_node() {
		this.node.io.inputs.set_count(0, 1);
		this.node.io.inputs.set_depends_on_inputs(false);
		this.node.io.outputs.set_has_one_output();
		this.node.io.inputs.add_on_set_input_hook('on_input_updated:update_parent', () => {
			this.on_input_updated();
		});
	}

	static on_input_updated(node: BaseObjNodeType) {
		if (node.io.inputs.input(0) != null) {
			node.root.add_to_parent_transform(node);
		} else {
			node.root.remove_from_parent_transform(node);
		}
	}
	on_input_updated() {
		HierarchyController.on_input_updated(this.node);
	}
}

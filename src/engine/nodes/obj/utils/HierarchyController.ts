import {NodeParamsConfig} from '../../utils/params/ParamsConfig';
import {TypedObjNode, BaseObjNodeType} from '../_Base';
import {Object3D} from 'three/src/core/Object3D';
import {TransformController, TransformedObjNode} from './TransformController';

class HierarchyParamsConfig extends NodeParamsConfig {}
export class HierarchyObjNode extends TypedObjNode<Object3D, HierarchyParamsConfig> {
	readonly hierarchyController: HierarchyController = new HierarchyController(this);
}

export class HierarchyController {
	constructor(private node: HierarchyObjNode) {}

	initializeNode() {
		this.node.io.inputs.setCount(0, 1);
		this.node.io.inputs.set_depends_on_inputs(false);
		this.node.io.outputs.set_has_one_output();
		this.node.io.inputs.add_on_set_input_hook('on_input_updated:update_parent', () => {
			this.on_input_updated();
		});
	}

	static on_input_updated(node: BaseObjNodeType) {
		const parent_object = node.root().getParentForNode(node);
		if (node.transformController && parent_object) {
			TransformController.update_node_transform_params_if_required(node as TransformedObjNode, parent_object);
		}

		if (node.io.inputs.input(0) != null) {
			node.root().addToParentTransform(node as HierarchyObjNode);
		} else {
			node.root().removeFromParentTransform(node as HierarchyObjNode);
		}
	}
	on_input_updated() {
		HierarchyController.on_input_updated(this.node);
	}
}

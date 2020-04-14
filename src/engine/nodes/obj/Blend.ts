import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {FlagsControllerD} from '../utils/FlagsController';
import {AxesHelper} from 'three/src/helpers/AxesHelper';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {Quaternion} from 'three/src/math/Quaternion';
import {HierarchyController} from './utils/HierarchyController';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
class BlendObjParamConfig extends NodeParamsConfig {
	update = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			BlendObjNode.PARAM_CALLBACK_cancel_parent_rotation(node as BlendObjNode);
		},
	});
}
const ParamsConfig = new BlendObjParamConfig();

export class BlendObjNode extends TypedObjNode<Group, BlendObjParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'blend';
	}
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper = new AxesHelper(1);

	create_object() {
		return new Group();
	}
	initialize_node() {
		this.hierarchy_controller.initialize_node();
		this.io.inputs.add_on_set_input_hook('on_input_updated:cancel_parent_rotation', () => {
			this.cancel_parent_rotation();
		});

		// setup frame dependency to update the matrix
		const graph_node = new CoreGraphNode(this.scene, 'time');
		graph_node.add_graph_input(this.scene.time_controller.graph_node);
		graph_node.add_post_dirty_hook('blend_on_frame_change', () => {
			this.cancel_parent_rotation();
		});

		// helper
		this.object.add(this._helper);
		this.flags.display.add_hook(() => {
			this._helper.visible = this.flags.display.active;
		});
	}
	cook() {
		this.cook_controller.end_cook();
	}

	static PARAM_CALLBACK_cancel_parent_rotation(node: BlendObjNode) {
		node.cancel_parent_rotation();
	}
	private _parent_quat: Quaternion = new Quaternion();
	cancel_parent_rotation() {
		const parent = this.object.parent;
		if (parent) {
			parent.updateWorldMatrix(true, true);
			parent.getWorldQuaternion(this._parent_quat);
			this._parent_quat.inverse();
			this.object.setRotationFromQuaternion(this._parent_quat);
		}
	}
}

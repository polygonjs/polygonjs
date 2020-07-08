import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {FlagsControllerD} from '../utils/FlagsController';
import {AxesHelper} from 'three/src/helpers/AxesHelper';
import {HierarchyController} from './utils/HierarchyController';
import {Object3D} from 'three/src/core/Object3D';
import {NodeContext} from '../../poly/NodeContext';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class BlendObjParamConfig extends NodeParamsConfig {
	object0 = ParamConfig.OPERATOR_PATH('/geo1', {
		node_selection: {
			context: NodeContext.OBJ,
		},
	});
	object1 = ParamConfig.OPERATOR_PATH('/geo2', {
		node_selection: {
			context: NodeContext.OBJ,
		},
	});
	blend = ParamConfig.FLOAT(0, {
		range: [0, 1],
		range_locked: [false, false],
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
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}
	initialize_node() {
		this.hierarchy_controller.initialize_node();
		this.io.inputs.set_count(0);

		this.add_post_dirty_hook('blend_on_dirty', () => {
			this.cook_controller.cook_main_without_inputs();
		});

		// helper
		this.object.add(this._helper);
		this.flags.display.add_hook(() => {
			this._helper.visible = this.flags.display.active;
		});
	}
	cook() {
		const obj_node0 = this.p.object0.found_node_with_context(NodeContext.OBJ);
		const obj_node1 = this.p.object1.found_node_with_context(NodeContext.OBJ);
		console.log(obj_node0?.full_path(), obj_node1?.full_path());
		if (obj_node0 && obj_node1) {
			this._blend(obj_node0.object, obj_node1.object);
		}

		this.cook_controller.end_cook();
	}

	private _blend(object0: Object3D, object1: Object3D) {
		this._object.position.copy(object0.position).lerp(object1.position, this.pv.blend);
		this._object.quaternion.copy(object0.quaternion).slerp(object1.quaternion, this.pv.blend);
		if (!this._object.matrixAutoUpdate) {
			this._object.updateMatrix();
		}
	}
}

import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {FlagsControllerD} from '../utils/FlagsController';
import {AxesHelper} from 'three/src/helpers/AxesHelper';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {HierarchyController} from './utils/HierarchyController';
class NullObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {}
const ParamsConfig = new NullObjParamConfig();

export class NullObjNode extends TypedObjNode<Group, NullObjParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);
	readonly transform_controller: TransformController = new TransformController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper = new AxesHelper(1);

	create_object() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}
	initialize_node() {
		this.hierarchy_controller.initialize_node();
		this.transform_controller.initialize_node();
		this.object.add(this._helper);
		this._helper.matrixAutoUpdate = false;
		this.flags.display.add_hook(() => {
			this._helper.visible = this.flags.display.active;
		});
	}
	cook() {
		this.transform_controller.update();
		this.cook_controller.end_cook();
	}
}

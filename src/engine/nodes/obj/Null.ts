import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {CoreTransform} from 'src/core/Transform';
import {FlagsControllerD} from '../utils/FlagsController';
import {AxesHelper} from 'three/src/helpers/AxesHelper';

import {NodeParamsConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class NullObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {}
const ParamsConfig = new NullObjParamConfig();

export class NullObjNode extends TypedObjNode<Group, NullObjParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}
	readonly transform_controller: TransformController = new TransformController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);

	create_object() {
		return new Group();
	}
	initialize_node() {
		this.transform_controller.initialize_node();

		const helper = new AxesHelper(1);
		this.object.add(helper);
	}
	private _core_transform = new CoreTransform();
	cook() {
		const matrix = this._core_transform.matrix(this.pv.t, this.pv.r, this.pv.s, this.pv.scale);
		this.transform_controller.update(matrix);
		this.cook_controller.end_cook();
	}
}

/**
 * created a 3D box
 *
 * @remarks
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Box3} from 'three/src/math/Box3';
import {BaseNodeType} from '../_Base';

const OUTPUT_NAME = 'box3';
class Box3ActorParamsConfig extends NodeParamsConfig {
	/** @param position representing the lower bound of the box */
	min = ParamConfig.VECTOR3([-1, -1, -1], {
		callback: (node: BaseNodeType) => {
			Box3ActorNode.PARAM_CALLBACK_updateBox3(node as Box3ActorNode);
		},
	});
	/** @param position representing the upper bound of the box */
	max = ParamConfig.VECTOR3([1, 1, 1], {
		callback: (node: BaseNodeType) => {
			Box3ActorNode.PARAM_CALLBACK_updateBox3(node as Box3ActorNode);
		},
	});
}
const ParamsConfig = new Box3ActorParamsConfig();
export class Box3ActorNode extends TypedActorNode<Box3ActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'box3';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.initializeNode();
		// this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function((index: number) => OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [ActorConnectionPointType.BOX3]);
	}

	private _box3 = new Box3();
	private _box3Updated = false;
	public override outputValue(context: ActorNodeTriggerContext) {
		if (!this._box3Updated) {
			this._updateBox3();
			this._box3Updated = true;
		}
		return this._box3;
	}

	static PARAM_CALLBACK_updateBox3(node: Box3ActorNode) {
		node._updateBox3();
	}
	private _updateBox3() {
		this._box3.min.copy(this.pv.min);
		this._box3.max.copy(this.pv.max);
	}
}

/**
 * creates a Vector3
 *
 * @remarks
 *
 *
 */
import {ParamType} from './../../poly/ParamType';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector3} from 'three';

const OUTPUT_NAME = ActorConnectionPointType.VECTOR3;
class Vector3ActorParamsConfig extends NodeParamsConfig {
	/** @param vector value */
	Vector3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Vector3ActorParamsConfig();
export class Vector3ActorNode extends TypedActorNode<Vector3ActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector3';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.VECTOR3),
		]);
	}

	private _tmpV3 = new Vector3();
	public override outputValue(context: ActorNodeTriggerContext) {
		const Vector3 = this._inputValueFromParam<ParamType.VECTOR3>(this.p.Vector3, context);

		this._tmpV3.copy(Vector3);

		return this._tmpV3;
	}
}

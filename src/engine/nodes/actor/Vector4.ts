/**
 * creates a Vector4
 *
 * @remarks
 *
 *
 */
import {ParamType} from './../../poly/ParamType';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector4} from 'three';

const OUTPUT_NAME = ActorConnectionPointType.VECTOR3;
class Vector4ActorParamsConfig extends NodeParamsConfig {
	/** @param vector value */
	Vector4 = ParamConfig.VECTOR4([0, 0, 0, 0]);
}
const ParamsConfig = new Vector4ActorParamsConfig();
export class Vector4ActorNode extends TypedActorNode<Vector4ActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector4';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.VECTOR4),
		]);
	}

	private _tmpV4 = new Vector4();
	public override outputValue(context: ActorNodeTriggerContext) {
		const Vector4 = this._inputValueFromParam<ParamType.VECTOR4>(this.p.Vector4, context);

		this._tmpV4.copy(Vector4);

		return this._tmpV4;
	}
}

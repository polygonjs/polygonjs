/**
 * converts a float to a vector4
 *
 *
 */
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {
	ActorConnectionPointType,
	ActorConnectionPoint,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Vector4} from 'three';
import {ParamType} from '../../poly/ParamType';
const tmpV4 = new Vector4();

class FloatToVec4ActorParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
	w = ParamConfig.FLOAT(0);
}
const ParamsConfig4 = new FloatToVec4ActorParamsConfig();
export class FloatToVec4ActorNode extends TypedActorNode<FloatToVec4ActorParamsConfig> {
	override paramsConfig = ParamsConfig4;
	static override type() {
		return 'floatToVec4';
	}
	static readonly OUTPUT_NAME = 'vec4';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(FloatToVec4ActorNode.OUTPUT_NAME, ActorConnectionPointType.VECTOR4),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const x = this._inputValueFromParam<ParamType.FLOAT>(this.p.x, context);
		const y = this._inputValueFromParam<ParamType.FLOAT>(this.p.y, context);
		const z = this._inputValueFromParam<ParamType.FLOAT>(this.p.z, context);
		const w = this._inputValueFromParam<ParamType.FLOAT>(this.p.w, context);
		tmpV4.set(x, y, z, w);
		return tmpV4;
	}
}

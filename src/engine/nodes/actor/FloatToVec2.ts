import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {
	ActorConnectionPointType,
	ActorConnectionPoint,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Vector2} from 'three';
import {ParamType} from '../../poly/ParamType';
const tmpV2 = new Vector2();

class FloatToVec2ActorParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
}
const ParamsConfig2 = new FloatToVec2ActorParamsConfig();
export class FloatToVec2ActorNode extends TypedActorNode<FloatToVec2ActorParamsConfig> {
	override paramsConfig = ParamsConfig2;
	static override type() {
		return 'floatToVec2';
	}
	static readonly OUTPUT_NAME = 'vec2';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(FloatToVec2ActorNode.OUTPUT_NAME, ActorConnectionPointType.VECTOR2),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const x = this._inputValueFromParam<ParamType.FLOAT>(this.p.x, context);
		const y = this._inputValueFromParam<ParamType.FLOAT>(this.p.y, context);
		tmpV2.set(x, y);
		return tmpV2;
	}
}

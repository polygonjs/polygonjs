import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {ActorConversionMiscOutputName} from './_ConversionMisc';

class FloatToIntActorParamsConfig extends NodeParamsConfig {
	float = ParamConfig.FLOAT(0);
}
const ParamsConfigFloatToInt = new FloatToIntActorParamsConfig();
export class FloatToIntActorNode extends TypedActorNode<FloatToIntActorParamsConfig> {
	override paramsConfig = ParamsConfigFloatToInt;
	static override type() {
		return 'floatToInt';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(ActorConversionMiscOutputName.INT, ActorConnectionPointType.INTEGER),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const float = this._inputValueFromParam<ParamType.FLOAT>(this.p.float, context);
		return Math.floor(float);
	}
}

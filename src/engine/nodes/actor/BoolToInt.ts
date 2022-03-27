import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {ActorConversionMiscOutputName} from './_ConversionMisc';

class BoolToIntActorParamsConfig extends NodeParamsConfig {
	bool = ParamConfig.BOOLEAN(0);
}
const ParamsConfigBoolToInt = new BoolToIntActorParamsConfig();
export class BoolToIntActorNode extends TypedActorNode<BoolToIntActorParamsConfig> {
	override paramsConfig = ParamsConfigBoolToInt;
	static override type() {
		return 'boolToInt';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(ActorConversionMiscOutputName.INT, ActorConnectionPointType.INTEGER),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const bool = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.bool, context);
		return bool ? 1 : 0;
	}
}

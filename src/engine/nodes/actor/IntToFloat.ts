import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {ActorConversionMiscOutputName} from './_ConversionMisc';

class IntToFloatActorParamsConfig extends NodeParamsConfig {
	int = ParamConfig.INTEGER(0);
}
const ParamsConfigIntToFloat = new IntToFloatActorParamsConfig();
export class IntToFloatActorNode extends TypedActorNode<IntToFloatActorParamsConfig> {
	override paramsConfig = ParamsConfigIntToFloat;
	static override type() {
		return 'intToFloat';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(ActorConversionMiscOutputName.FLOAT, ActorConnectionPointType.FLOAT),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const int = this._inputValueFromParam<ParamType.INTEGER>(this.p.int, context);
		return int;
	}
}

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {ActorConversionMiscOutputName} from './_ConversionMisc';

class IntToBoolActorParamsConfig extends NodeParamsConfig {
	int = ParamConfig.INTEGER(0);
}
const ParamsConfigIntToBool = new IntToBoolActorParamsConfig();
export class IntToBoolActorNode extends TypedActorNode<IntToBoolActorParamsConfig> {
	override paramsConfig = ParamsConfigIntToBool;
	static override type() {
		return 'intToBool';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(ActorConversionMiscOutputName.BOOL, ActorConnectionPointType.BOOLEAN),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const int = this._inputValueFromParam<ParamType.INTEGER>(this.p.int, context);
		return Boolean(int);
	}
}

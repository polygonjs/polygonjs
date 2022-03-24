import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';

//
//
// FLOAT TO INT
//
//
const OUTPUT_NAME_INT = 'int';
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
			new ActorConnectionPoint(OUTPUT_NAME_INT, ActorConnectionPointType.INTEGER),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const float = this._inputValueFromParam<ParamType.FLOAT>(this.p.float, context);
		return Math.floor(float);
	}
}

//
//
// INT TO FLOAT
//
//
const OUTPUT_NAME_FLOAT = 'float';
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
			new ActorConnectionPoint(OUTPUT_NAME_FLOAT, ActorConnectionPointType.FLOAT),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const int = this._inputValueFromParam<ParamType.INTEGER>(this.p.int, context);
		return int;
	}
}

//
//
// INT TO BOOL
//
//
const OUTPUT_NAME_BOOL = 'bool';
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
			new ActorConnectionPoint(OUTPUT_NAME_BOOL, ActorConnectionPointType.BOOLEAN),
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

//
//
// BOOL TO INT
//
//
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
			new ActorConnectionPoint(OUTPUT_NAME_INT, ActorConnectionPointType.INTEGER),
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

/**
 * Debug prints out the inputs values it receives to the console
 *
 *
 */
import {BaseParamOptions} from './../../params/utils/OptionsController';
import {CoreType, isBooleanTrue} from './../../../core/Type';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType, ReturnValueTypeByActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {Number2, Number3, Number4} from '../../../types/GlobalTypes';
import {Poly} from '../../Poly';

function valueParamOptions(): BaseParamOptions {
	return {cook: false, hidden: true};
}
const tmpV2Array: Number2 = [0, 0];
const tmpV3Array: Number3 = [0, 0, 0];
const tmpV4Array: Number4 = [0, 0, 0, 0];

class DebugActorParamsConfig extends NodeParamsConfig {
	printInConsole = ParamConfig.BOOLEAN(1);
	boolean = ParamConfig.BOOLEAN(0, valueParamOptions());
	color = ParamConfig.COLOR([0, 0, 0], valueParamOptions());
	float = ParamConfig.FLOAT(0, valueParamOptions());
	integer = ParamConfig.INTEGER(0, valueParamOptions());
	string = ParamConfig.STRING(' ', valueParamOptions());
	vector2 = ParamConfig.VECTOR2([0, 0], valueParamOptions());
	vector3 = ParamConfig.VECTOR3([0, 0, 0], valueParamOptions());
	vector4 = ParamConfig.VECTOR4([0, 0, 0, 0], valueParamOptions());
}
const ParamsConfig = new DebugActorParamsConfig();

export class DebugActorNode extends TypedActorNode<DebugActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'debug';
	}
	static INPUT_NAME = 'in';
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this.expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}
	expectedInputTypes() {
		const type = this.io.connection_points.first_input_connection_type() || ActorConnectionPointType.FLOAT;
		return [type, ActorConnectionPointType.FLOAT];
	}
	protected _expectedOutputTypes() {
		const type = this.expectedInputTypes()[0];
		return [type];
	}
	protected _expectedInputName(index: number) {
		return DebugActorNode.INPUT_NAME;
	}
	public override receiveTrigger(context: ActorNodeTriggerContext) {
		console.log('receiveTrigger', this.path(), context);
		this.runTrigger(context);
	}
	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		let val = this._inputValue(this._expectedInputName(0), context);
		if (val == null) {
			val = 0;
		}
		if (isBooleanTrue(this.pv.printInConsole)) {
			console.log('outputValue', this.path(), context, val);
		}
		if (!Poly.playerMode()) {
			this._setDisplayParam(val);
		}
		return val;
	}
	private _setDisplayParam<T extends ActorConnectionPointType>(val: ReturnValueTypeByActorConnectionPointType[T]) {
		const inputType = this.expectedInputTypes()[0];
		switch (inputType) {
			case ActorConnectionPointType.BOOLEAN: {
				if (CoreType.isBoolean(val)) {
					return this.p.boolean.set(val);
				}
			}
			case ActorConnectionPointType.COLOR: {
				if (CoreType.isColor(val)) {
					val.toArray(tmpV3Array);
					return this.p.color.set(tmpV3Array);
				}
			}
			case ActorConnectionPointType.FLOAT: {
				if (CoreType.isNumber(val)) {
					return this.p.float.set(val);
				}
			}
			case ActorConnectionPointType.INTEGER: {
				if (CoreType.isNumber(val)) {
					return this.p.integer.set(val);
				}
			}
			case ActorConnectionPointType.STRING: {
				if (CoreType.isString(val)) {
					return this.p.string.set(val);
				}
			}
			case ActorConnectionPointType.VECTOR2: {
				if (CoreType.isVector(val)) {
					val.toArray(tmpV2Array);
					return this.p.vector2.set(tmpV2Array);
				}
			}
			case ActorConnectionPointType.VECTOR3: {
				if (CoreType.isVector(val)) {
					val.toArray(tmpV3Array);
					return this.p.vector3.set(tmpV3Array);
				}
			}
			case ActorConnectionPointType.VECTOR4: {
				if (CoreType.isVector(val)) {
					val.toArray(tmpV4Array);
					return this.p.vector4.set(tmpV4Array);
				}
			}
		}
	}
}

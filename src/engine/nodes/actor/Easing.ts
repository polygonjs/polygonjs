/**
 * applies an easing function to the input
 *
 *
 *
 */
import {Vector2, Vector3, Vector4} from 'three';
import {CoreType} from './../../../core/Type';
import {ReturnValueTypeByActorConnectionPointType} from './../utils/io/connections/Actor';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {Easing, EASING_NAMES} from '../../../core/math/Easing';

type AllowedInputType =
	| ActorConnectionPointType.FLOAT
	| ActorConnectionPointType.VECTOR2
	| ActorConnectionPointType.VECTOR3
	| ActorConnectionPointType.VECTOR4;
const ALLOWED_INPUTS: AllowedInputType[] = [
	ActorConnectionPointType.FLOAT,
	ActorConnectionPointType.VECTOR2,
	ActorConnectionPointType.VECTOR3,
	ActorConnectionPointType.VECTOR4,
];

const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();

const INPUT_NAME = 'in';
const OUTPUT_NAME = 'out';
const defaultEaseType = EASING_NAMES.indexOf('easeIO3');
class EasingActorParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(defaultEaseType, {
		menu: {
			entries: EASING_NAMES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	// input = ParamConfig.FLOAT(0);
}
const ParamsConfig = new EasingActorParamsConfig();

export class EasingActorNode extends TypedActorNode<EasingActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'easing';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['type']);
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._actorInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._actorOutputName.bind(this));

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.FLOAT),
		]);
	}

	private _expectedInputTypes() {
		const type = (this.io.connection_points.first_input_connection_type() ||
			ActorConnectionPointType.FLOAT) as AllowedInputType;
		if (ALLOWED_INPUTS.includes(type)) {
			return [type];
		} else {
			return [ActorConnectionPointType.FLOAT];
		}
	}
	private _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	private _actorInputName(index: number): string {
		return INPUT_NAME;
	}
	private _actorOutputName(index: number): string {
		return OUTPUT_NAME;
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const inputValue = this._inputValue<AllowedInputType>(INPUT_NAME, context);
		const methodName = EASING_NAMES[this.pv.type];
		const easingFunction = Easing[methodName];
		if (CoreType.isNumber(inputValue)) {
			return easingFunction(inputValue);
		}
		if (CoreType.isVector(inputValue)) {
			if (inputValue instanceof Vector2) {
				tmpV2.x = easingFunction(inputValue.x);
				tmpV2.y = easingFunction(inputValue.y);
				return tmpV2;
			}
			if (inputValue instanceof Vector3) {
				tmpV3.x = easingFunction(inputValue.x);
				tmpV3.y = easingFunction(inputValue.y);
				tmpV3.z = easingFunction(inputValue.z);
				return tmpV3;
			}
			if (inputValue instanceof Vector4) {
				tmpV4.x = easingFunction(inputValue.x);
				tmpV4.y = easingFunction(inputValue.y);
				tmpV4.z = easingFunction(inputValue.z);
				tmpV4.w = easingFunction(inputValue.w);
				return tmpV4;
			}
		}
	}
}

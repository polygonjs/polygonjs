/**
 * calculates the length of a vector
 *
 *
 *
 */
import {Number3, PolyDictionary} from '../../../types/GlobalTypes';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

enum LengthActorNodeInputName {
	V = 'v',
}
const DefaultValues: PolyDictionary<Number3> = {
	[LengthActorNodeInputName.V]: [0, 0, 1],
};

const ALLOWED_INPUT_TYPES: ActorConnectionPointType[] = [
	ActorConnectionPointType.VECTOR2,
	ActorConnectionPointType.VECTOR3,
	ActorConnectionPointType.VECTOR4,
];

type MixedVector =
	| ActorConnectionPointType.VECTOR2
	| ActorConnectionPointType.VECTOR3
	| ActorConnectionPointType.VECTOR4;

class LengthParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new LengthParamsConfig();

export class LengthActorNode extends TypedActorNode<LengthParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'length';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}

	protected _expectedInputTypes() {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type =
			firstType && ALLOWED_INPUT_TYPES.includes(firstType) ? firstType : ActorConnectionPointType.VECTOR3;
		return [type];
	}
	protected _expectedInputName(index: number) {
		return [LengthActorNodeInputName.V][index];
	}
	protected _expectedOutputTypes() {
		return [ActorConnectionPointType.FLOAT];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const v = this._inputValue<MixedVector>(LengthActorNodeInputName.V, context);

		return v?.length() || 0;
	}
}

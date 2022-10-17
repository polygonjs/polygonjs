/**
 * applies a simple addition and multiplication to the input value
 *
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector2, Vector3} from 'three';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

enum MaxLengthActorNodeInputName {
	VALUE = 'value',
	MAX = 'max',
}
const DefaultValues: PolyDictionary<number> = {
	[MaxLengthActorNodeInputName.VALUE]: 0,
	[MaxLengthActorNodeInputName.MAX]: 1,
};

const ALLOWED_INPUT_TYPES: ActorConnectionPointType[] = [
	ActorConnectionPointType.VECTOR2,
	ActorConnectionPointType.VECTOR3,
];

type MixedVector = ActorConnectionPointType.VECTOR2 | ActorConnectionPointType.VECTOR3;
type MixedType = ActorConnectionPointType.FLOAT | MixedVector;

interface Vectors {
	v2: Vector2;
	v3: Vector3;
}
function _createVectors(): Vectors {
	return {
		v2: new Vector2(),
		v3: new Vector3(),
	};
}

class MaxLengthActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new MaxLengthActorParamsConfig();

export class MaxLengthActorNode extends TypedActorNode<MaxLengthActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'maxLength';
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
		return [type, ActorConnectionPointType.FLOAT];
	}
	protected _expectedInputName(index: number) {
		return [MaxLengthActorNodeInputName.VALUE, MaxLengthActorNodeInputName.MAX][index];
	}
	protected _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	private _valTmp = _createVectors();
	public override outputValue(context: ActorNodeTriggerContext) {
		const value = this._inputValue<MixedType>(MaxLengthActorNodeInputName.VALUE, context);
		const max = this._inputValue<ActorConnectionPointType.FLOAT>(MaxLengthActorNodeInputName.MAX, context) || 1;

		if (value instanceof Vector2) {
			return this._valTmp.v2.copy(value).clampLength(0, max);
		}
		if (value instanceof Vector3) {
			return this._valTmp.v3.copy(value).clampLength(0, max);
		}

		return 0;
	}
}

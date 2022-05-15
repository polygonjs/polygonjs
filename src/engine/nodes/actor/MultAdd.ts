/**
 * clamps the input value between a min and a max
 *
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector2, Vector3, Vector4} from 'three';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {CoreType} from '../../../core/Type';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

enum MultAddActorNodeInputName {
	VALUE = 'value',
	PRE_ADD = 'preAdd',
	MULT = 'mult',
	POST_ADD = 'postAdd',
}
const DefaultValues: PolyDictionary<number> = {
	[MultAddActorNodeInputName.VALUE]: 0,
	[MultAddActorNodeInputName.PRE_ADD]: 0,
	[MultAddActorNodeInputName.MULT]: 1,
	[MultAddActorNodeInputName.POST_ADD]: 0,
};

const ALLOWED_INPUT_TYPES: ActorConnectionPointType[] = [
	ActorConnectionPointType.FLOAT,
	ActorConnectionPointType.VECTOR2,
	ActorConnectionPointType.VECTOR3,
	ActorConnectionPointType.VECTOR4,
];

type MixedVector =
	| ActorConnectionPointType.VECTOR2
	| ActorConnectionPointType.VECTOR3
	| ActorConnectionPointType.VECTOR4;
type MixedType = ActorConnectionPointType.FLOAT | MixedVector;

interface Vectors {
	v2: Vector2;
	v3: Vector3;
	v4: Vector4;
}
function _createVectors(): Vectors {
	return {
		v2: new Vector2(),
		v3: new Vector3(),
		v4: new Vector4(),
	};
}

class MultAddActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new MultAddActorParamsConfig();

export class MultAddActorNode extends TypedActorNode<MultAddActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'multAdd';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}

	protected _expectedInputTypes() {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type = firstType && ALLOWED_INPUT_TYPES.includes(firstType) ? firstType : ActorConnectionPointType.FLOAT;
		return [type, type, type, type];
	}
	protected _expectedInputName(index: number) {
		return [
			MultAddActorNodeInputName.VALUE,
			MultAddActorNodeInputName.PRE_ADD,
			MultAddActorNodeInputName.MULT,
			MultAddActorNodeInputName.POST_ADD,
		][index];
	}
	protected _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	private _valTmp = _createVectors();
	public override outputValue(context: ActorNodeTriggerContext) {
		const value = this._inputValue<MixedType>(MultAddActorNodeInputName.VALUE, context);
		const preAdd = this._inputValue<MixedType>(MultAddActorNodeInputName.PRE_ADD, context);
		const mult = this._inputValue<MixedType>(MultAddActorNodeInputName.MULT, context);
		const postAdd = this._inputValue<MixedType>(MultAddActorNodeInputName.POST_ADD, context);

		if (value instanceof Vector2) {
			return this._valTmp.v2
				.copy(value)
				.add(preAdd as Vector2)
				.multiply(mult as Vector2)
				.add(postAdd as Vector2);
		}
		if (value instanceof Vector3) {
			return this._valTmp.v3
				.copy(value)
				.add(preAdd as Vector3)
				.multiply(mult as Vector3)
				.add(postAdd as Vector3);
		}
		if (value instanceof Vector4) {
			return this._valTmp.v4
				.copy(value)
				.add(preAdd as Vector4)
				.multiply(mult as Vector4)
				.add(postAdd as Vector4);
		}
		if (CoreType.isNumber(value)) {
			return (1 + (preAdd as number)) * (mult as number) + (postAdd as number);
		}
		return 0;
	}
}

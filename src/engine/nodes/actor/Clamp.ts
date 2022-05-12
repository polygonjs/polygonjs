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
import {CoreMath} from '../../../core/math/_Module';

enum ClampActorNodeInputName {
	VALUE = 'value0',
	MIN = 'min',
	MAX = 'max',
}
const DefaultValues: PolyDictionary<number> = {
	[ClampActorNodeInputName.VALUE]: 0,
	[ClampActorNodeInputName.MIN]: 0,
	[ClampActorNodeInputName.MAX]: 1,
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

class ClampActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ClampActorParamsConfig();

export class ClampActorNode extends TypedActorNode<ClampActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'clamp';
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
		return [type, type, type];
	}
	protected _expectedInputName(index: number) {
		return [ClampActorNodeInputName.VALUE, ClampActorNodeInputName.MIN, ClampActorNodeInputName.MAX][index];
	}
	protected _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	private _valTmp = _createVectors();
	public override outputValue(context: ActorNodeTriggerContext) {
		const value = this._inputValue<MixedType>(ClampActorNodeInputName.VALUE, context);
		const min = this._inputValue<MixedType>(ClampActorNodeInputName.MIN, context);
		const max = this._inputValue<MixedType>(ClampActorNodeInputName.MAX, context);

		if (value instanceof Vector2) {
			this._valTmp.v2.copy(value);
			this._valTmp.v2.x = CoreMath.clamp(this._valTmp.v2.x, (min as Vector2).x, (max as Vector2).x);
			this._valTmp.v2.y = CoreMath.clamp(this._valTmp.v2.y, (min as Vector2).y, (max as Vector2).y);
			return this._valTmp.v2;
		}
		if (value instanceof Vector3) {
			this._valTmp.v3.copy(value);
			this._valTmp.v3.x = CoreMath.clamp(this._valTmp.v3.x, (min as Vector3).x, (max as Vector3).x);
			this._valTmp.v3.y = CoreMath.clamp(this._valTmp.v3.y, (min as Vector3).y, (max as Vector3).y);
			this._valTmp.v3.z = CoreMath.clamp(this._valTmp.v3.z, (min as Vector3).z, (max as Vector3).z);
			return this._valTmp.v3;
		}
		if (value instanceof Vector4) {
			this._valTmp.v4.copy(value);
			this._valTmp.v4.x = CoreMath.clamp(this._valTmp.v4.x, (min as Vector4).x, (max as Vector4).x);
			this._valTmp.v4.y = CoreMath.clamp(this._valTmp.v4.y, (min as Vector4).y, (max as Vector4).y);
			this._valTmp.v4.z = CoreMath.clamp(this._valTmp.v4.z, (min as Vector4).z, (max as Vector4).z);
			this._valTmp.v4.w = CoreMath.clamp(this._valTmp.v4.w, (min as Vector4).w, (max as Vector4).w);
			return this._valTmp.v4;
		}
		if (CoreType.isNumber(value)) {
			return CoreMath.clamp(value, min as number, max as number);
		}
		return 0;
	}
}

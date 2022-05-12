/**
 * mix 2 input values
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

enum MixActorNodeInputName {
	VALUE0 = 'value0',
	VALUE1 = 'value1',
	BLEND = 'blend',
}
const DefaultValues: PolyDictionary<number> = {
	[MixActorNodeInputName.VALUE0]: 0,
	[MixActorNodeInputName.VALUE1]: 1,
	[MixActorNodeInputName.BLEND]: 0.5,
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

class MixActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new MixActorParamsConfig();

export class MixActorNode extends TypedActorNode<MixActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'mix';
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
		return [type, type, ActorConnectionPointType.FLOAT];
	}
	protected _expectedInputName(index: number) {
		return [MixActorNodeInputName.VALUE0, MixActorNodeInputName.VALUE1, MixActorNodeInputName.BLEND][index];
	}
	protected _expectedOutputTypes() {
		const inputTypes = this._expectedInputTypes();
		const type = inputTypes[0];
		return [type];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	private _val0Tmp = _createVectors();
	private _val1Tmp = _createVectors();
	public override outputValue(context: ActorNodeTriggerContext) {
		const value0 = this._inputValue<MixedType>(MixActorNodeInputName.VALUE0, context);
		const value1 = this._inputValue<MixedType>(MixActorNodeInputName.VALUE1, context);
		const blend = this._inputValue<ActorConnectionPointType.FLOAT>(MixActorNodeInputName.BLEND, context) || 0.5;

		if (CoreType.isVector(value0) && CoreType.isVector(value1)) {
			const val0Tmp = this._vectorTmp(value0, this._val0Tmp) as Vector3;
			const val1Tmp = this._vectorTmp(value1, this._val1Tmp) as Vector3;
			return val0Tmp.multiplyScalar(1 - blend).add(val1Tmp.multiplyScalar(blend));
		} else {
			if (CoreType.isNumber(value0) && CoreType.isNumber(value1)) {
				return (1 - blend) * value0 + blend * value1;
			}
		}

		return 0;
	}
	private _vectorTmp<V extends Vector2 | Vector3 | Vector4>(vecSrc: Vector2 | Vector3 | Vector4, target: Vectors): V {
		if (vecSrc instanceof Vector2) {
			target.v2.copy(vecSrc);
			return target.v2 as V;
		}
		if (vecSrc instanceof Vector3) {
			target.v3.copy(vecSrc);
			return target.v3 as V;
		}
		if (vecSrc instanceof Vector4) {
			target.v4.copy(vecSrc);
			return target.v4 as V;
		}
		return target.v2 as V;
	}
}

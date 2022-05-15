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

enum SmoothstepActorNodeInputName {
	EDGE0 = 'edge0',
	EDGE1 = 'edge1',
	X = 'x',
}
const DefaultValues: PolyDictionary<number> = {
	[SmoothstepActorNodeInputName.EDGE0]: 0,
	[SmoothstepActorNodeInputName.EDGE1]: 1,
	[SmoothstepActorNodeInputName.X]: 0,
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

function smoothstep(edge0: number, edge1: number, value: number) {
	const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
	return x * x * (3 - 2 * x);
}

class SmoothstepActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SmoothstepActorParamsConfig();

export class SmoothstepActorNode extends TypedActorNode<SmoothstepActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'smoothstep';
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
		return [SmoothstepActorNodeInputName.EDGE0, SmoothstepActorNodeInputName.EDGE1, SmoothstepActorNodeInputName.X][
			index
		];
	}
	protected _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	private _valTmp = _createVectors();
	public override outputValue(context: ActorNodeTriggerContext) {
		const edge0 = this._inputValue<MixedType>(SmoothstepActorNodeInputName.EDGE0, context);
		const edge1 = this._inputValue<MixedType>(SmoothstepActorNodeInputName.EDGE1, context);
		const x = this._inputValue<MixedType>(SmoothstepActorNodeInputName.X, context);

		if (x instanceof Vector2) {
			this._valTmp.v2.copy(x);

			this._valTmp.v2.x = smoothstep((edge0 as Vector2).x, (edge1 as Vector2).x, this._valTmp.v2.x);
			this._valTmp.v2.y = smoothstep((edge0 as Vector2).y, (edge1 as Vector2).y, this._valTmp.v2.y);

			this._valTmp.v2;
		}
		if (x instanceof Vector3) {
			this._valTmp.v3.copy(x);

			this._valTmp.v3.x = smoothstep((edge0 as Vector3).x, (edge1 as Vector3).x, this._valTmp.v3.x);
			this._valTmp.v3.y = smoothstep((edge0 as Vector3).y, (edge1 as Vector3).y, this._valTmp.v3.y);
			this._valTmp.v3.z = smoothstep((edge0 as Vector3).z, (edge1 as Vector3).z, this._valTmp.v3.z);

			this._valTmp.v3;
		}
		if (x instanceof Vector4) {
			this._valTmp.v4.copy(x);

			this._valTmp.v4.x = smoothstep((edge0 as Vector4).x, (edge1 as Vector4).x, this._valTmp.v4.x);
			this._valTmp.v4.y = smoothstep((edge0 as Vector4).y, (edge1 as Vector4).y, this._valTmp.v4.y);
			this._valTmp.v4.z = smoothstep((edge0 as Vector4).z, (edge1 as Vector4).z, this._valTmp.v4.z);
			this._valTmp.v4.w = smoothstep((edge0 as Vector4).w, (edge1 as Vector4).z, this._valTmp.v4.w);

			this._valTmp.v4;
		}
		if (CoreType.isNumber(x)) {
			return smoothstep(edge0 as number, edge1 as number, x as number);
		}
		return 0;
	}
}

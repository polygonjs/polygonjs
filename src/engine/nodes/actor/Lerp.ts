/**
 * calculates the cross product between 2 vectors
 *
 *
 *
 */
import {Number3, PolyDictionary} from '../../../types/GlobalTypes';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector2, Vector3, Vector4} from 'three';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

enum LerpActorNodeInputName {
	V0 = 'v0',
	V1 = 'v1',
	ALPHA = 'alpha',
}
const DefaultValues: PolyDictionary<Number3 | number> = {
	[LerpActorNodeInputName.V0]: [0, 0, 0],
	[LerpActorNodeInputName.V1]: [0, 0, 1],
	[LerpActorNodeInputName.ALPHA]: 0,
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

class LerpActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new LerpActorParamsConfig();

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

export class LerpActorNode extends TypedActorNode<LerpActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'lerp';
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
		return [type, type, ActorConnectionPointType.FLOAT];
	}
	protected _expectedInputName(index: number) {
		return [LerpActorNodeInputName.V0, LerpActorNodeInputName.V1, LerpActorNodeInputName.ALPHA][index];
	}
	protected _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	private _valTmp = _createVectors();
	public override outputValue(context: ActorNodeTriggerContext) {
		const v0 = this._inputValue<MixedVector>(LerpActorNodeInputName.V0, context);
		const v1 = this._inputValue<MixedVector>(LerpActorNodeInputName.V1, context);
		const alpha = this._inputValue<ActorConnectionPointType.FLOAT>(LerpActorNodeInputName.ALPHA, context);

		if (alpha != null) {
			if (v0 instanceof Vector2 && v1 instanceof Vector2) {
				return this._valTmp.v2.lerpVectors(v0, v1, alpha);
			}
			if (v0 instanceof Vector3 && v1 instanceof Vector3) {
				return this._valTmp.v3.lerpVectors(v0, v1, alpha);
			}
			if (v0 instanceof Vector4 && v1 instanceof Vector4) {
				return this._valTmp.v4.lerpVectors(v0, v1, alpha);
			}
		}

		return 0;
	}
}

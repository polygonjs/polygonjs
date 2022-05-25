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
import {Vector2, Vector3, Vector4} from 'three';

enum NormalizeActorNodeInputName {
	V = 'v',
}
const DefaultValues: PolyDictionary<Number3> = {
	[NormalizeActorNodeInputName.V]: [0, 0, 1],
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

class LengthParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new LengthParamsConfig();

export class NormalizeActorNode extends TypedActorNode<LengthParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'normalize';
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
		return [NormalizeActorNodeInputName.V][index];
	}
	protected _expectedOutputTypes() {
		return this._expectedInputTypes();
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	private _valTmp = _createVectors();
	public override outputValue(context: ActorNodeTriggerContext) {
		const v = this._inputValue<MixedVector>(NormalizeActorNodeInputName.V, context);

		if (v instanceof Vector2) {
			return this._valTmp.v2.copy(v).normalize();
		}
		if (v instanceof Vector3) {
			return this._valTmp.v3.copy(v).normalize();
		}
		if (v instanceof Vector4) {
			return this._valTmp.v4.copy(v).normalize();
		}
		return this._valTmp.v3;
	}
}

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

enum DotActorNodeInputName {
	V0 = 'v0',
	V1 = 'v1',
}
const DefaultValues: PolyDictionary<Number3> = {
	[DotActorNodeInputName.V0]: [0, 0, 0],
	[DotActorNodeInputName.V1]: [0, 0, 1],
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

class DotActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new DotActorParamsConfig();

export class DotActorNode extends TypedActorNode<DotActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'dot';
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
		return [type, type];
	}
	protected _expectedInputName(index: number) {
		return [DotActorNodeInputName.V0, DotActorNodeInputName.V1][index];
	}
	protected _expectedOutputTypes() {
		return [ActorConnectionPointType.FLOAT];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const v0 = this._inputValue<MixedVector>(DotActorNodeInputName.V0, context);
		const v1 = this._inputValue<MixedVector>(DotActorNodeInputName.V1, context);

		if (v0 instanceof Vector2 && v1 instanceof Vector2) {
			return v0.dot(v1);
		}
		if (v0 instanceof Vector3 && v1 instanceof Vector3) {
			return v0.dot(v1);
		}
		if (v0 instanceof Vector4 && v1 instanceof Vector4) {
			return v0.dot(v1);
		}

		return 0;
	}
}

/**
 * calculates the cross product between 2 vectors
 *
 *
 *
 */
import {Number3, PolyDictionary} from '../../../types/GlobalTypes';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector2, Vector3} from 'three';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

enum CrossActorNodeInputName {
	V0 = 'v0',
	V1 = 'v1',
}
const DefaultValues: PolyDictionary<Number3> = {
	[CrossActorNodeInputName.V0]: [1, 0, 0],
	[CrossActorNodeInputName.V1]: [0, 1, 0],
};

const ALLOWED_INPUT_TYPES: ActorConnectionPointType[] = [
	ActorConnectionPointType.VECTOR2,
	ActorConnectionPointType.VECTOR3,
];

type MixedVector = ActorConnectionPointType.VECTOR2 | ActorConnectionPointType.VECTOR3;

class CrossActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CrossActorParamsConfig();

const v3 = new Vector3();

export class CrossActorNode extends TypedActorNode<CrossActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'cross';
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
		return [CrossActorNodeInputName.V0, CrossActorNodeInputName.V1][index];
	}
	protected _expectedOutputTypes() {
		const firstType = this._expectedInputTypes()[0];
		switch (firstType) {
			case ActorConnectionPointType.VECTOR2: {
				return [ActorConnectionPointType.FLOAT];
			}
		}
		return [ActorConnectionPointType.VECTOR3];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const v0 = this._inputValue<MixedVector>(CrossActorNodeInputName.V0, context);
		const v1 = this._inputValue<MixedVector>(CrossActorNodeInputName.V1, context);

		if (v0 instanceof Vector2 && v1 instanceof Vector2) {
			return v0.cross(v1);
		}
		if (v0 instanceof Vector3 && v1 instanceof Vector3) {
			return v3.crossVectors(v0, v1);
		}

		return v3;
	}
}

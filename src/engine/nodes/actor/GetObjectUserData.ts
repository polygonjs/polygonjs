/**
 * get an object property
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_TYPES,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class GetObjectUserDataActorParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.FLOAT), {
		menu: {
			entries: ACTOR_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	name = ParamConfig.STRING('');
}
const ParamsConfig = new GetObjectUserDataActorParamsConfig();

export class GetObjectUserDataActorNode extends TypedActorNode<GetObjectUserDataActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getObjectUserData';
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);
		this.io.connection_points.set_output_name_function((index: number) => GetObjectUserDataActorNode.OUTPUT_NAME);
		// this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [this._currentConnectionType()]);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const connectionType = ACTOR_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		return connectionType;
	}
	setUserDataType(type: ActorConnectionPointType) {
		this.p.type.set(ACTOR_CONNECTION_POINT_TYPES.indexOf(type));
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;

		return Object3D.userData[this.pv.name];
	}
}

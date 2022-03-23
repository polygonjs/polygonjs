/**
 * get an object attribute
 *
 *
 */

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ActorConnectionPointTypeToArrayTypeMap,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {CoreObject} from '../../../core/geometry/Object';

class GetChildrenAttributesActorParamsConfig extends NodeParamsConfig {
	attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new GetChildrenAttributesActorParamsConfig();

export class GetChildrenAttributesActorNode extends TypedActorNode<GetChildrenAttributesActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getChildrenAttributes';
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

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_output_name_function(
			(index: number) => GetChildrenAttributesActorNode.OUTPUT_NAME
		);
		this.io.connection_points.set_expected_output_types_function(() => [this._currentConnectionType()]);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const connectionType = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const arrayConnectionType = ActorConnectionPointTypeToArrayTypeMap[connectionType];
		return arrayConnectionType;
	}

	setAttribType(type: ActorConnectionPointType) {
		this.p.type.set(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(type));
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const {Object3D} = context;
		return Object3D.children.map((child) =>
			CoreObject.attribValue(child, this.pv.attribName)
		) as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
	}
}

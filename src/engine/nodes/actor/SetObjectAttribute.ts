/**
 * Update the object material
 *
 *
 */

import {
	ActorNodeTriggerContext,
	ACTOR_NODE_SELF_TRIGGER_CALLBACK,
	TRIGGER_CONNECTION_NAME,
	TypedActorNode,
} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreObject} from '../../../core/geometry/Object';
import {AttribValue} from '../../../types/GlobalTypes';
// import {PolyDictionary} from '../../../types/GlobalTypes';
// import {BaseParamType} from '../../params/_Base';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
// function typedVisibleOptions(type: ActorConnectionPointType, otherParamVal: PolyDictionary<number | boolean> = {}) {
// 	const val = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(type);
// 	return {visibleIf: {type: val, ...otherParamVal}};
// }

class SetObjectAttributeActorParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	trigger = ParamConfig.BUTTON(null, ACTOR_NODE_SELF_TRIGGER_CALLBACK);
	/** @param attribute name */
	attribName = ParamConfig.STRING('');
	/** @param attribute type */
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	// boolean = ParamConfig.BOOLEAN(0, typedVisibleOptions(ActorConnectionPointType.BOOLEAN));
	// color = ParamConfig.COLOR([0, 0, 0], typedVisibleOptions(ActorConnectionPointType.COLOR));
	// float = ParamConfig.FLOAT(0, typedVisibleOptions(ActorConnectionPointType.FLOAT));
	// integer = ParamConfig.INTEGER(0, typedVisibleOptions(ActorConnectionPointType.INTEGER));
	// string = ParamConfig.STRING('', typedVisibleOptions(ActorConnectionPointType.STRING));
	// vector2 = ParamConfig.VECTOR2([0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR2));
	// vector3 = ParamConfig.VECTOR3([0, 0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR3));
	// vector4 = ParamConfig.VECTOR4([0, 0, 0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR4));
}
const ParamsConfig = new SetObjectAttributeActorParamsConfig();

export class SetObjectAttributeActorNode extends TypedActorNode<SetObjectAttributeActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectAttribute';
	}
	static INPUT_NAME_VAL = 'val';

	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['attribName', 'type']);

		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);

		// this.io.connection_points.set_output_name_function((index: number) => ConstantActorNode.OUTPUT_NAME);
		this.io.connection_points.set_input_name_function(() => SetObjectAttributeActorNode.INPUT_NAME_VAL);
		this.io.connection_points.set_expected_input_types_function(() => [this._currentConnectionType()]);
		this.io.connection_points.set_expected_output_types_function(() => []);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const connectionType = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		return connectionType || ActorConnectionPointType.FLOAT;
	}
	// private _currentConnectionType() {
	// 	if (this.pv.type == null) {
	// 		console.warn(`${this.type()} actor node type not valid`);
	// 	}
	// 	const connectionType = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES[this.pv.type];
	// 	if (connectionType == null) {
	// 		console.warn(`${this.type()} actor node type not valid`);
	// 	}
	// 	return connectionType;
	// }
	// currentParam(): BaseParamType {
	// 	const type = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES[this.pv.type];
	// 	switch (type) {
	// 		case ActorConnectionPointType.BOOLEAN: {
	// 			return this.p.boolean;
	// 		}
	// 		case ActorConnectionPointType.COLOR: {
	// 			return this.p.color;
	// 		}
	// 		case ActorConnectionPointType.FLOAT: {
	// 			return this.p.float;
	// 		}
	// 		case ActorConnectionPointType.INTEGER: {
	// 			return this.p.integer;
	// 		}
	// 		case ActorConnectionPointType.STRING: {
	// 			return this.p.string;
	// 		}
	// 		case ActorConnectionPointType.VECTOR2: {
	// 			return this.p.vector2;
	// 		}
	// 		case ActorConnectionPointType.VECTOR3: {
	// 			return this.p.vector3;
	// 		}
	// 		case ActorConnectionPointType.VECTOR4: {
	// 			return this.p.vector4;
	// 		}
	// 	}
	// 	// we should never run this
	// 	return this.p.boolean;
	// }
	setAttribType(type: ActorConnectionPointType) {
		this.p.type.set(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(type));
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const {Object3D} = context;

		const attribValue = this._inputValue(SetObjectAttributeActorNode.INPUT_NAME_VAL, context) as AttribValue;
		CoreObject.setAttribute(Object3D, this.pv.attribName, attribValue);
	}
}

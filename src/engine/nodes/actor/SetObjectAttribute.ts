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
import {ParamType} from '../../poly/ParamType';
import {CoreType} from '../../../core/Type';
import {Color, Vector3} from 'three';
// import {PolyDictionary} from '../../../types/GlobalTypes';
// import {BaseParamType} from '../../params/_Base';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
// function typedVisibleOptions(type: ActorConnectionPointType, otherParamVal: PolyDictionary<number | boolean> = {}) {
// 	const val = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(type);
// 	return {visibleIf: {type: val, ...otherParamVal}};
// }
const tmpColor = new Color();
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
	/** @param lerp */
	lerp = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [false, false],
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
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;

		const lerp = this._inputValueFromParam<ParamType.FLOAT>(this.p.lerp, context);
		const attribValue = this._inputValue(SetObjectAttributeActorNode.INPUT_NAME_VAL, context) as AttribValue;
		console.log(attribValue);

		const attribName = this.pv.attribName;
		if (lerp >= 1) {
			return CoreObject.setAttribute(Object3D, attribName, attribValue);
		} else {
			const currentValue = CoreObject.attribValue(Object3D, attribName);
			if (CoreType.isNumber(attribValue) && CoreType.isNumber(currentValue)) {
				const newValue = lerp * attribValue + (1 - lerp) * currentValue;
				console.log(lerp, attribValue, newValue);
				return CoreObject.setAttribute(Object3D, attribName, newValue);
			}
			if (CoreType.isVector(attribValue) && CoreType.isVector(currentValue)) {
				return currentValue.lerp(attribValue as any, lerp);
			}
			if ((CoreType.isColor(attribValue) || attribValue instanceof Vector3) && CoreType.isColor(currentValue)) {
				// since the objects do not yet have a color attribute, we check here if it is either a vector or a color
				// and if it is a vector3, we copy it to tmpColor
				if (CoreType.isColor(attribValue)) {
					return currentValue.lerp(attribValue, lerp);
				} else {
					tmpColor.r = attribValue.x;
					tmpColor.g = attribValue.y;
					tmpColor.b = attribValue.z;
					return currentValue.lerp(tmpColor, lerp);
				}
			}
			// if the value cannot be lerp, we set it directly
			return CoreObject.setAttribute(Object3D, attribName, attribValue);
		}
	}
}

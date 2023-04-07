/**
 * Update the object attribute
 *
 *
 */

import {
	// JS_NODE_SELF_TRIGGER_CALLBACK,
	TRIGGER_CONNECTION_NAME,
	TypedJsNode,
} from './_Base';
import {
	JsConnectionPoint,
	JsConnectionPointType,
	JS_CONNECTION_POINT_IN_NODE_DEF,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
// import {CoreObject} from '../../../core/geometry/Object';
// import {AttribValue} from '../../../types/GlobalTypes';
// import {CoreType} from '../../../core/Type';
// import {Color, Vector3} from 'three';
// import {PolyDictionary} from '../../../types/GlobalTypes';
// import {BaseParamType} from '../../params/_Base';
enum SetObjectAttributeInputName {
	attribName = 'attribName',
	lerp = 'lerp',
}

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
// function typedVisibleOptions(type: ActorConnectionPointType, otherParamVal: PolyDictionary<number | boolean> = {}) {
// 	const val = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(type);
// 	return {visibleIf: {type: val, ...otherParamVal}};
// }
// const tmpColor = new Color();
class SetObjectAttributeJsParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	// trigger = ParamConfig.BUTTON(null, JS_NODE_SELF_TRIGGER_CALLBACK);
	/** @param attribute name */
	attribName = ParamConfig.STRING('');
	/** @param attribute type */
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	/** @param lerp */
	// lerp = ParamConfig.FLOAT(1, {
	// 	range: [0, 1],
	// 	rangeLocked: [false, false],
	// });
	// boolean = ParamConfig.BOOLEAN(0, typedVisibleOptions(ActorConnectionPointType.BOOLEAN));
	// color = ParamConfig.COLOR([0, 0, 0], typedVisibleOptions(ActorConnectionPointType.COLOR));
	// float = ParamConfig.FLOAT(0, typedVisibleOptions(ActorConnectionPointType.FLOAT));
	// integer = ParamConfig.INTEGER(0, typedVisibleOptions(ActorConnectionPointType.INTEGER));
	// string = ParamConfig.STRING('', typedVisibleOptions(ActorConnectionPointType.STRING));
	// vector2 = ParamConfig.VECTOR2([0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR2));
	// vector3 = ParamConfig.VECTOR3([0, 0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR3));
	// vector4 = ParamConfig.VECTOR4([0, 0, 0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR4));
}
const ParamsConfig = new SetObjectAttributeJsParamsConfig();

export class SetObjectAttributeJsNode extends TypedJsNode<SetObjectAttributeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectAttribute';
	}
	static INPUT_NAME_VAL = 'val';

	override initializeNode() {
		// this.io.connection_points.spare_params.setInputlessParamNames([ 'type']);

		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				SetObjectAttributeInputName.attribName,
				JsConnectionPointType.STRING,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint<JsConnectionPointType.FLOAT>('lerp', JsConnectionPointType.FLOAT, {
				...CONNECTION_OPTIONS,
				init_value: 1,
			}),
		]);

		// this.io.connection_points.set_output_name_function((index: number) => ConstantActorNode.OUTPUT_NAME);
		this.io.connection_points.set_input_name_function(() => SetObjectAttributeJsNode.INPUT_NAME_VAL);
		this.io.connection_points.set_expected_input_types_function(() => [this._currentConnectionType()]);
		this.io.connection_points.set_output_name_function(
			(i) => [TRIGGER_CONNECTION_NAME, JsConnectionPointType.OBJECT_3D][i]
		);
		this.io.connection_points.set_expected_output_types_function(() => [
			JsConnectionPointType.TRIGGER,
			JsConnectionPointType.OBJECT_3D,
		]);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} js node type not valid`);
		}
		const connectionType = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} js node type not valid`);
		}
		return connectionType || JsConnectionPointType.FLOAT;
	}

	setAttribType(type: JsConnectionPointType) {
		this.p.type.set(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}

	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const attribName = this.variableForInput(shadersCollectionController, SetObjectAttributeInputName.attribName);
		const lerp = this.variableForInput(shadersCollectionController, SetObjectAttributeInputName.lerp);
		const newValue = this.variableForInput(shadersCollectionController, SetObjectAttributeJsNode.INPUT_NAME_VAL);

		const func = Poly.namedFunctionsRegister.getFunction('setObjectAttribute', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, attribName, lerp, newValue);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}

	// public override receiveTrigger(context: ActorNodeTriggerContext) {
	// 	const Object3D =
	// 		this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
	// 		context.Object3D;

	// 	const lerp = this._inputValue('lerp', context) as number;
	// 	const attribValue = this._inputValue(SetObjectAttributeActorNode.INPUT_NAME_VAL, context) as AttribValue;

	// 	const attribName = this.pv.attribName;

	// 	const _setAttributeValue = () => {
	// 		if (!CoreObject.hasAttrib(Object3D, attribName)) {
	// 			this.states.error.set(`attribute ${this.pv.attribName} not found`);
	// 		} else {
	// 			this.states.error.clear();
	// 		}
	// 		if (lerp >= 1) {
	// 			return CoreObject.setAttribute(Object3D, attribName, attribValue);
	// 		} else {
	// 			const currentValue = CoreObject.attribValue(Object3D, attribName);
	// 			if (CoreType.isNumber(attribValue) && CoreType.isNumber(currentValue)) {
	// 				const newValue = lerp * attribValue + (1 - lerp) * currentValue;
	// 				return CoreObject.setAttribute(Object3D, attribName, newValue);
	// 			}
	// 			if (CoreType.isVector(attribValue) && CoreType.isVector(currentValue)) {
	// 				return currentValue.lerp(attribValue as any, lerp);
	// 			}
	// 			if (
	// 				(CoreType.isColor(attribValue) || attribValue instanceof Vector3) &&
	// 				CoreType.isColor(currentValue)
	// 			) {
	// 				// since the objects do not yet have a color attribute, we check here if it is either a vector or a color
	// 				// and if it is a vector3, we copy it to tmpColor
	// 				if (CoreType.isColor(attribValue)) {
	// 					return currentValue.lerp(attribValue, lerp);
	// 				} else {
	// 					tmpColor.r = attribValue.x;
	// 					tmpColor.g = attribValue.y;
	// 					tmpColor.b = attribValue.z;
	// 					return currentValue.lerp(tmpColor, lerp);
	// 				}
	// 			}
	// 			// if the value cannot be lerp, we set it directly
	// 			return CoreObject.setAttribute(Object3D, attribName, attribValue);
	// 		}
	// 	};
	// 	_setAttributeValue();
	// 	this.runTrigger(context);
	// }
}

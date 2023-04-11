/**
 * get an object attribute
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	JsConnectionPoint,
	JsConnectionPointType,
	JS_CONNECTION_POINT_IN_NODE_DEF,
	ParamConvertibleJsType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {StringParam} from '../../params/String';
// import {CoreObject} from '../../../core/geometry/Object';
// import {Vector2, Vector3, Vector4} from 'three';
// const tmpV2 = new Vector2();
// const tmpV3 = new Vector3();
// const tmpV4 = new Vector4();

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

// function typedVisibleOptions(type: ActorConnectionPointType, otherParamVal: PolyDictionary<number | boolean> = {}) {
// 	const val = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(type);
// 	return {visibleIf: {type: val, ...otherParamVal}};
// }
enum GetObjectAttributeInputName {
	attribName = 'attribName',
}

class GetObjectAttributeJsParamsConfig extends NodeParamsConfig {
	// attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.map((name, value) => ({name, value})),
		},
	});
	// boolean = ParamConfig.BOOLEAN(0, typedVisibleOptions(ActorConnectionPointType.BOOLEAN));
	// color = ParamConfig.COLOR([0, 0, 0], typedVisibleOptions(ActorConnectionPointType.COLOR));
	// float = ParamConfig.FLOAT(0, typedVisibleOptions(ActorConnectionPointType.FLOAT));
	// integer = ParamConfig.INTEGER(0, typedVisibleOptions(ActorConnectionPointType.INTEGER));
	// vector2 = ParamConfig.VECTOR2([0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR2));
	// vector3 = ParamConfig.VECTOR3([0, 0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR3));
	// vector4 = ParamConfig.VECTOR4([0, 0, 0, 0], typedVisibleOptions(ActorConnectionPointType.VECTOR4));
}
const ParamsConfig = new GetObjectAttributeJsParamsConfig();

export class GetObjectAttributeJsNode extends TypedJsNode<GetObjectAttributeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getObjectAttribute';
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				GetObjectAttributeInputName.attribName,
				JsConnectionPointType.STRING,
				CONNECTION_OPTIONS
			),
		]);

		// this.io.connection_points.spare_params.setInputlessParamNames([
		// 	'attribName',
		// 	'type',
		// 	'boolean',
		// 	'color',
		// 	'float',
		// 	'integer',
		// 	'vector2',
		// 	'vector3',
		// 	'vector4',
		// ]);
		this.io.connection_points.set_expected_input_types_function(() => []);
		// this.io.connection_points.set_input_name_function((index: number) => GetObjectAttributeInputName.attribName);
		this.io.connection_points.set_expected_output_types_function(() => [this._currentConnectionType()]);
		this.io.connection_points.set_output_name_function((index: number) => GetObjectAttributeJsNode.OUTPUT_NAME);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} js node type not valid`);
		}
		const connection_type = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
		if (connection_type == null) {
			console.warn(`${this.type()} js node type not valid`);
		}
		return connection_type;
	}
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
	setAttribType(type: ParamConvertibleJsType) {
		this.p.type.set(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	setAttribName(attribName: string) {
		(this.params.get(GetObjectAttributeInputName.attribName) as StringParam).set(attribName);
	}
	attributeName() {
		return (this.params.get(GetObjectAttributeInputName.attribName) as StringParam).value;
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const attribName = this.variableForInput(shadersCollectionController, GetObjectAttributeInputName.attribName);
		const out = this.jsVarName(GetObjectAttributeJsNode.OUTPUT_NAME);
		const dataType = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];

		const func = Poly.namedFunctionsRegister.getFunction('getObjectAttribute', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, attribName, `'${dataType}'`);
		shadersCollectionController.addBodyOrComputed(this, [{dataType, varName: out, value: bodyLine}]);
	}

	// public override outputValue(
	// 	context: ActorNodeTriggerContext
	// ): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
	// 	const Object3D =
	// 		this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
	// 		context.Object3D;
	// 	const attribValue = CoreObject.attribValue(Object3D, this.pv.attribName);
	// 	if (attribValue == null) {
	// 		this.states.error.set(`attribute ${this.pv.attribName} not found`);
	// 	} else {
	// 		this.states.error.clear();
	// 	}

	// 	if (attribValue instanceof Vector2) {
	// 		return tmpV2.copy(attribValue);
	// 	}
	// 	if (attribValue instanceof Vector3) {
	// 		return tmpV3.copy(attribValue);
	// 	}
	// 	if (attribValue instanceof Quaternion || attribValue instanceof Vector4) {
	// 		tmpV4.x = attribValue.x;
	// 		tmpV4.y = attribValue.y;
	// 		tmpV4.z = attribValue.z;
	// 		tmpV4.w = attribValue.w;
	// 		return tmpV4;
	// 	}
	// 	return attribValue as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
	// }
}

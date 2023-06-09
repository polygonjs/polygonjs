/**
 * get an object user data
 *
 *
 */

import {TypedJsNode} from './_Base';
import {
	JsConnectionPoint,
	JsConnectionPointType,
	JS_CONNECTION_POINT_TYPES,
	JS_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {JsType} from '../../poly/registers/nodes/types/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class GetObjectUserDataJsParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	name = ParamConfig.STRING('');
}
const ParamsConfig = new GetObjectUserDataJsParamsConfig();

export class GetObjectUserDataJsNode extends TypedJsNode<GetObjectUserDataJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.GET_OBJECT_USER_DATA;
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.connection_points.set_output_name_function((index: number) => GetObjectUserDataJsNode.OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [this._currentConnectionType()]);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const connectionType = JS_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		return connectionType;
	}
	setUserDataType(type: JsConnectionPointType) {
		this.p.type.set(JS_CONNECTION_POINT_TYPES.indexOf(type));
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		// const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, shadersCollectionController);

		const userDataName = this.variableForInputParam(shadersCollectionController, this.p.name);
		const dataType = this._currentConnectionType();
		const varName = this.jsVarName(GetObjectUserDataJsNode.OUTPUT_NAME);
		// const _f = (propertyName: string, type: JsConnectionPointType) => {
		// if (!usedOutputNames.includes(userDataName)) {
		// 	return;
		// }
		const func = Poly.namedFunctionsRegister.getFunction('getObjectUserData', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType,
				varName,
				value: func.asString(object3D, userDataName),
			},
		]);
		// };

		// OBJECT_VECTOR3_PROPERTIES.forEach((propertyName) => {
		// 	_f(propertyName, JsConnectionPointType.VECTOR3);
		// });
		// OBJECT_BOOLEAN_PROPERTIES.forEach((propertyName) => {
		// 	_f(propertyName, JsConnectionPointType.BOOLEAN);
		// });
		// _f('quaternion', JsConnectionPointType.QUATERNION);
		// _f('matrix', JsConnectionPointType.MATRIX4);
		// _f('material', JsConnectionPointType.MATERIAL);
	}

	// public override outputValue(
	// 	context: JsNodeTriggerContext,
	// 	outputName: string
	// ): ReturnValueTypeByJsConnectionPointType[JsConnectionPointType] | undefined {
	// 	const Object3D =
	// 		this._inputValue<JsConnectionPointType.OBJECT_3D>(JsConnectionPointType.OBJECT_3D, context) ||
	// 		context.Object3D;

	// 	return Object3D.userData[this.pv.name];
	// }
}

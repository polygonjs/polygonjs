/**
 * get an object's children attributes and returns an array
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	JsConnectionPoint,
	JsConnectionPointType,
	JsConnectionPointTypeToArrayTypeMap,
	JS_CONNECTION_POINT_IN_NODE_DEF,
	ParamConvertibleJsType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {StringParam} from '../../params/String';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GetChildrenAttributesInputName {
	attribName = 'attribName',
}

class GetChildrenAttributesJsParamsConfig extends NodeParamsConfig {
	// attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new GetChildrenAttributesJsParamsConfig();

export class GetChildrenAttributesJsNode extends TypedJsNode<GetChildrenAttributesJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getChildrenAttributes';
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				GetChildrenAttributesInputName.attribName,
				JsConnectionPointType.STRING,
				CONNECTION_OPTIONS
			),
		]);

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_output_name_function((index: number) => GetChildrenAttributesJsNode.OUTPUT_NAME);
		this.io.connection_points.set_expected_output_types_function(() => [this._currentConnectionType()]);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const connectionType = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const arrayConnectionType = JsConnectionPointTypeToArrayTypeMap[connectionType];
		return arrayConnectionType;
	}

	setAttribType(type: ParamConvertibleJsType) {
		this.p.type.set(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	attribType(): JsConnectionPointType {
		return PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
	}
	setAttribName(attribName: string) {
		(this.params.get(GetChildrenAttributesInputName.attribName) as StringParam).set(attribName);
	}
	attributeName() {
		return (this.params.get(GetChildrenAttributesInputName.attribName) as StringParam).value;
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const attribName = this.variableForInput(
			shadersCollectionController,
			GetChildrenAttributesInputName.attribName
		);
		const varName = this.jsVarName(GetChildrenAttributesJsNode.OUTPUT_NAME);
		const dataType = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];

		const arrayType = JsConnectionPointTypeToArrayTypeMap[dataType];
		const variable = createVariable(arrayType);
		if (variable) {
			shadersCollectionController.addVariable(this, varName, variable);
		}

		const func = Poly.namedFunctionsRegister.getFunction(
			'getChildrenAttributes',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, attribName, `'${dataType}'`, varName);
		shadersCollectionController.addBodyOrComputed(this, [{dataType, varName, value: bodyLine}]);
	}
}

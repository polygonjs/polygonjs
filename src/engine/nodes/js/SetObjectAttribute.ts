/**
 * Update the object attribute
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {
	JsConnectionPoint,
	JsConnectionPointType,
	JS_CONNECTION_POINT_IN_NODE_DEF,
	ParamConvertibleJsType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {StringParam} from '../../params/String';
import {JsType} from '../../poly/registers/nodes/types/Js';
export enum SetObjectAttributeInputName {
	attribName = 'attribName',
	lerp = 'lerp',
	val = 'val',
}

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class SetObjectAttributeJsParamsConfig extends NodeParamsConfig {
	/** @param attribute type */
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new SetObjectAttributeJsParamsConfig();

export class SetObjectAttributeJsNode extends TypedJsNode<SetObjectAttributeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_OBJECT_ATTRIBUTE;
	}

	override initializeNode() {
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

		this.io.connection_points.set_input_name_function(() => SetObjectAttributeInputName.val);
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

	private _nextAttribName: string = '';
	override paramDefaultValue(name: SetObjectAttributeInputName) {
		return {
			[SetObjectAttributeInputName.attribName]: this._nextAttribName,
			[SetObjectAttributeInputName.lerp]: 1,
			[SetObjectAttributeInputName.val]: 0,
		}[name];
	}
	setAttribType(type: ParamConvertibleJsType) {
		this.p.type.set(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	setAttribName(attribName: string) {
		const param = this.params.get(SetObjectAttributeInputName.attribName) as StringParam | undefined;
		if (param) {
			param.set(attribName);
		} else {
			this._nextAttribName = attribName;
		}
	}
	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);
	}
	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const attribName = this.variableForInput(shadersCollectionController, SetObjectAttributeInputName.attribName);
		const lerp = this.variableForInput(shadersCollectionController, SetObjectAttributeInputName.lerp);
		const newValue = this.variableForInput(shadersCollectionController, SetObjectAttributeInputName.val);

		const func = Poly.namedFunctionsRegister.getFunction('setObjectAttribute', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, attribName, lerp, newValue, `'${this._currentConnectionType()}'`);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}

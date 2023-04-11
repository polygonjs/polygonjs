/**
 * sends a trigger when a child attribute has been updated
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	JsConnectionPoint,
	JsConnectionPointType,
	JsConnectionPointTypeToArrayTypeMap,
	JS_CONNECTION_POINT_IN_NODE_DEF,
	ParamConvertibleJsType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {StringParam} from '../../params/String';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {WatchedValueJsDefinition} from './utils/JsDefinition';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum OnChildAttributeUpdateInputName {
	attribName = 'attribName',
}

class OnChildAttributeUpdateJsParamsConfig extends NodeParamsConfig {
	// attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new OnChildAttributeUpdateJsParamsConfig();

export class OnChildAttributeUpdateJsNode extends TypedJsNode<OnChildAttributeUpdateJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_CHILD_ATTRIBUTE_UPDATE;
	}
	override isTriggering() {
		return true;
	}

	static readonly OUTPUT_NEW_VALUES = 'newValues';
	static readonly OUTPUT_PREV_VALUES = 'previousValues';
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				OnChildAttributeUpdateInputName.attribName,
				JsConnectionPointType.STRING,
				CONNECTION_OPTIONS
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_output_name_function(
			(index: number) =>
				[
					TRIGGER_CONNECTION_NAME,
					OnChildAttributeUpdateJsNode.OUTPUT_NEW_VALUES,
					OnChildAttributeUpdateJsNode.OUTPUT_PREV_VALUES,
				][index]
		);
		this.io.connection_points.set_expected_output_types_function(() => [
			JsConnectionPointType.TRIGGER,
			...this._currentConnectionType(),
		]);
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
		return [arrayConnectionType, arrayConnectionType];
	}

	setAttribType(type: ParamConvertibleJsType) {
		this.p.type.set(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	attribType(): JsConnectionPointType {
		return PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
	}
	setAttribName(attribName: string) {
		(this.params.get(OnChildAttributeUpdateInputName.attribName) as StringParam).set(attribName);
	}
	attributeName() {
		return (this.params.get(OnChildAttributeUpdateInputName.attribName) as StringParam).value;
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const type = this.attribType();
		const object3D = inputObject3D(this, shadersCollectionController);
		const attribName = this.variableForInput(
			shadersCollectionController,
			OnChildAttributeUpdateInputName.attribName
		);

		const getChildrenAttributesRef = Poly.namedFunctionsRegister.getFunction(
			'getChildrenAttributesRef',
			this,
			shadersCollectionController
		);

		const varName = this.jsVarName('in');
		const variable = createVariable(JsConnectionPointTypeToArrayTypeMap[type]);
		if (variable) {
			shadersCollectionController.addVariable(this, varName, variable);
		}
		shadersCollectionController.addDefinitions(this, [
			new WatchedValueJsDefinition(
				this,
				shadersCollectionController,
				type,
				getChildrenAttributesRef.asString(object3D, attribName, `'${type}'`, varName),
				`this.${nodeMethodName(this)}()`,
				{
					deep: true,
				}
			),
		]);

		// outputs
		const usedOutputNames = this.io.outputs.used_output_names();
		const _val = (
			propertyName: string,
			functionName: 'getChildrenAttributes' | 'getChildrenAttributesPrevious',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			const varName = this.jsVarName(propertyName);
			const variable = createVariable(JsConnectionPointTypeToArrayTypeMap[type]);
			if (variable) {
				shadersCollectionController.addVariable(this, varName, variable);
			}
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, attribName, `'${type}'`, varName),
				},
			]);
		};

		_val(OnChildAttributeUpdateJsNode.OUTPUT_NEW_VALUES, 'getChildrenAttributes', type);
		_val(OnChildAttributeUpdateJsNode.OUTPUT_PREV_VALUES, 'getChildrenAttributesPrevious', type);
	}

	override setTriggeringLines(shadersCollectionController: ShadersCollectionController, triggeredMethods: string) {
		const type = this.attribType();
		const object3D = inputObject3D(this, shadersCollectionController);
		const attribName = this.variableForInput(
			shadersCollectionController,
			OnChildAttributeUpdateInputName.attribName
		);
		const getChildrenAttributesRef = Poly.namedFunctionsRegister.getFunction(
			'getChildrenAttributesRef',
			this,
			shadersCollectionController
		);
		const varName = this.jsVarName('in');
		const variable = createVariable(JsConnectionPointTypeToArrayTypeMap[type]);
		if (variable) {
			shadersCollectionController.addVariable(this, varName, variable);
		}
		shadersCollectionController.addDefinitions(this, [
			new WatchedValueJsDefinition(
				this,
				shadersCollectionController,
				type,
				getChildrenAttributesRef.asString(object3D, attribName, `'${type}'`, varName),
				`this.${nodeMethodName(this)}()`,
				{
					deep: true,
				}
			),
		]);

		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {
			gatherable: false,
		});
	}
}

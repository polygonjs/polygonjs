import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariableAreaLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {FunctionConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssembler';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OutputAreaLightJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OutputAreaLightJsParamsConfig();

export class OutputAreaLightJsNode extends TypedJsNode<OutputAreaLightJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.OUTPUT_AREA_LIGHT;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(ObjectVariableAreaLight.INTENSITY, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableAreaLight.COLOR, JsConnectionPointType.COLOR, CONNECTION_OPTIONS),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const inputNames = this.io.inputs.namedInputConnectionPoints().map((c) => c.name());
		const bodyLines: string[] = [];
		if (inputNames) {
			for (const inputName of inputNames) {
				const input = this.io.inputs.named_input(inputName);

				if (input) {
					const varName = this.variableForInput(linesController, inputName);

					switch (inputName) {
						case ObjectVariableAreaLight.INTENSITY: {
							bodyLines.push(`${FunctionConstant.OBJECT_3D}.${inputName} = ${varName}`);
							break;
						}
						case ObjectVariableAreaLight.COLOR: {
							bodyLines.push(`${FunctionConstant.OBJECT_3D}.${inputName}.copy(${varName})`);
							break;
						}
					}
				}
			}
		}
		linesController._addBodyLines(this, bodyLines);
	}
}

/**
 * sets globals properties of the current area light
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariableAreaLight, ObjectVariableLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {ObjectBuilderAssemblerConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssemblerCommon';
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
			new JsConnectionPoint(ObjectVariableLight.INTENSITY, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableLight.COLOR, JsConnectionPointType.COLOR, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableAreaLight.WIDTH, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableAreaLight.HEIGHT, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
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
						case ObjectVariableLight.INTENSITY:
						case ObjectVariableAreaLight.WIDTH:
						case ObjectVariableAreaLight.HEIGHT: {
							bodyLines.push(`${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName} = ${varName}`);
							break;
						}
						case ObjectVariableLight.COLOR: {
							// we need to test the presence of the property, as we might not be processing only area lights
							bodyLines.push(`
								if(${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName} != null){
									${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName}.copy(${varName})
								}`);
							break;
						}
					}
				}
			}
		}
		linesController._addBodyLines(this, bodyLines);
	}
}

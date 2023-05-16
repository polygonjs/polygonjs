import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariableHemisphereLight, ObjectVariableLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {ObjectBuilderAssemblerConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssemblerCommon';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OutputHemisphereLightJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OutputHemisphereLightJsParamsConfig();

export class OutputHemisphereLightJsNode extends TypedJsNode<OutputHemisphereLightJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.OUTPUT_HEMISPHERE_LIGHT;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(ObjectVariableLight.INTENSITY, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				ObjectVariableHemisphereLight.SKY_COLOR,
				JsConnectionPointType.COLOR,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				ObjectVariableHemisphereLight.GROUND_COLOR,
				JsConnectionPointType.COLOR,
				CONNECTION_OPTIONS
			),
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
						case ObjectVariableLight.INTENSITY: {
							bodyLines.push(`${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName} = ${varName}`);
							break;
						}

						case ObjectVariableHemisphereLight.SKY_COLOR:
						case ObjectVariableHemisphereLight.GROUND_COLOR: {
							const paramName =
								inputName == ObjectVariableHemisphereLight.SKY_COLOR ? 'color' : 'groundColor';
							// we need to test the presence of the property, as we might not be processing only area lights
							bodyLines.push(`
								if(${ObjectBuilderAssemblerConstant.OBJECT_3D}.${paramName} != null){
									${ObjectBuilderAssemblerConstant.OBJECT_3D}.${paramName}.copy(${varName})
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

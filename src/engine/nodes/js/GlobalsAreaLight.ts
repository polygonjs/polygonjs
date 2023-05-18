/**
 * gets globals properties of an area light
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariableAreaLight, ObjectVariableLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {ObjectBuilderAssemblerConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssemblerCommon';
import {Color} from 'three';

class GlobalsAreaLightJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GlobalsAreaLightJsParamsConfig();

export class GlobalsAreaLightJsNode extends TypedJsNode<GlobalsAreaLightJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.GLOBALS_AREA_LIGHT;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(ObjectVariableLight.INTENSITY, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariableLight.COLOR, JsConnectionPointType.COLOR),
			new JsConnectionPoint(ObjectVariableAreaLight.WIDTH, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariableAreaLight.HEIGHT, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const bodyLines: string[] = [];

		const usedOutputNames = this.io.outputs.used_output_names();
		for (const outputName of usedOutputNames) {
			const varName = this.jsVarName(outputName);

			switch (outputName) {
				case ObjectVariableLight.INTENSITY:
				case ObjectVariableAreaLight.WIDTH:
				case ObjectVariableAreaLight.HEIGHT: {
					bodyLines.push(`if( ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName} != null ){
						${varName} = ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName}
					} else {
						${varName} = 0;
					}`);
					break;
				}
				case ObjectVariableLight.COLOR: {
					linesController.addVariable(this, new Color(), varName);
					bodyLines.push(`if( ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName} != null ){
						${varName}.copy(${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName})
					}`);
					break;
				}
			}
		}
		linesController._addBodyLines(this, bodyLines);
	}
}

/**
 * gets globals properties of an hemisphere light
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariableHemisphereLight, ObjectVariableLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {ObjectBuilderAssemblerConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssemblerCommon';
import {Color} from 'three';

class GlobalsHemisphereLightJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GlobalsHemisphereLightJsParamsConfig();

export class GlobalsHemisphereLightJsNode extends TypedJsNode<GlobalsHemisphereLightJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.GLOBALS_HEMISPHERE_LIGHT;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(ObjectVariableLight.INTENSITY, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariableHemisphereLight.SKY_COLOR, JsConnectionPointType.COLOR),
			new JsConnectionPoint(ObjectVariableHemisphereLight.GROUND_COLOR, JsConnectionPointType.COLOR),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const bodyLines: string[] = [];

		const usedOutputNames = this.io.outputs.used_output_names();
		for (const outputName of usedOutputNames) {
			const varName = this.jsVarName(outputName);

			switch (outputName) {
				case ObjectVariableLight.INTENSITY: {
					bodyLines.push(`if( ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName} != null ){
						${varName} = ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName}
					} else {
						${varName} = 0;
					}`);
					break;
				}

				case ObjectVariableHemisphereLight.SKY_COLOR:
				case ObjectVariableHemisphereLight.GROUND_COLOR: {
					const paramName = outputName == ObjectVariableHemisphereLight.SKY_COLOR ? 'color' : 'groundColor';
					linesController.addVariable(this, new Color(), varName);
					bodyLines.push(`if( ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${paramName} != null ){
						${varName}.copy(${ObjectBuilderAssemblerConstant.OBJECT_3D}.${paramName})
					}`);
					break;
				}
			}
		}
		linesController._addBodyLines(this, bodyLines);
	}
}

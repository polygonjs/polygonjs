import {TypedJsNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariableAreaLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {FunctionConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssembler';
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
			new JsConnectionPoint(ObjectVariableAreaLight.INTENSITY, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariableAreaLight.COLOR, JsConnectionPointType.COLOR),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const bodyLines: string[] = [];

		const usedOutputNames = this.io.outputs.used_output_names();
		for (const outputName of usedOutputNames) {
			const varName = this.jsVarName(outputName);

			switch (outputName) {
				case ObjectVariableAreaLight.INTENSITY: {
					bodyLines.push(`${varName} = ${FunctionConstant.OBJECT_3D}.${outputName}`);
					break;
				}
				case ObjectVariableAreaLight.COLOR: {
					linesController.addVariable(this, new Color(), varName);
					bodyLines.push(`${varName}.copy(${FunctionConstant.OBJECT_3D}.${outputName})`);
					break;
				}
			}
		}
		linesController._addBodyLines(this, bodyLines);
	}
}

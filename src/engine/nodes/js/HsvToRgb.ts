/**
 * convert HSV color to RGB
 *
 *
 */

import {Color} from 'three';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedJsNode} from './_Base';
import {ComputedValueJsDefinitionData, JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

class HsvToRgbParamsJsConfig extends NodeParamsConfig {
	hsv = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig_HsvToRgb = new HsvToRgbParamsJsConfig();
export class HsvToRgbJsNode extends TypedJsNode<HsvToRgbParamsJsConfig> {
	override paramsConfig = ParamsConfig_HsvToRgb;
	static override type() {
		return 'hsvToRgb';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.COLOR, JsConnectionPointType.COLOR),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const linesData: ComputedValueJsDefinitionData[] = [];

		const vec3 = this.variableForInputParam(linesController, this.p.hsv);

		const varName = this.jsVarName(JsConnectionPointType.COLOR);

		const tmpVar = linesController.addVariable(this, new Color());
		const func = Poly.namedFunctionsRegister.getFunction('hsvToRgb', this, linesController);

		linesData.push({
			dataType: JsConnectionPointType.COLOR,
			varName,
			value: func.asString(vec3, tmpVar),
		});

		linesController.addBodyOrComputed(this, linesData);
	}
}

/**
 * returns true if the device is a touch device
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const OUTPUT_NAME = 'isTouchDevice';

class IsTouchDeviceJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new IsTouchDeviceJsParamsConfig();
export class IsTouchDeviceJsNode extends TypedJsNode<IsTouchDeviceJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'isTouchDevice';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.BOOLEAN),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const varName = this.jsVarName(OUTPUT_NAME);

		const func = Poly.namedFunctionsRegister.getFunction('isTouchDevice', this, linesController);
		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.BOOLEAN, varName, value: func.asString()},
		]);
		return;
	}
}

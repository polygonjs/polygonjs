/**
 * returns the current device orientation
 *
 *
 *
 */
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ParamlessTypedJsNode} from './_Base';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {ComputedValueJsDefinition} from './utils/JsDefinition';

export class DeviceOrientationJsNode extends ParamlessTypedJsNode {
	static override type() {
		return 'deviceOrientation';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.QUATERNION, JsConnectionPointType.QUATERNION),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		const varName = this.jsVarName(JsConnectionPointType.QUATERNION);
		const func = Poly.namedFunctionsRegister.getFunction('deviceOrientation', this, linesController);
		const variable = createVariable(JsConnectionPointType.QUATERNION);
		if (variable) {
			const tmpVarName = linesController.addVariable(this, variable);

			linesController.addDefinitions(this, [
				new ComputedValueJsDefinition(
					this,
					linesController,
					JsConnectionPointType.QUATERNION,
					varName,
					func.asString(tmpVarName)
				),
			]);
		}
	}
}

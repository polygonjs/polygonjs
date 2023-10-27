/**
 * returns the current device orientation
 *
 *
 *
 */
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {TypedJsNode} from './_Base';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {ComputedValueJsDefinition} from './utils/JsDefinition';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {DEFAULT_SMOOTH_AMOUNT} from '../../../core/camera/controls/DeviceOrientationControls';

class DeviceOrientationJsParamsConfig extends NodeParamsConfig {
	smoothAmount = ParamConfig.FLOAT(DEFAULT_SMOOTH_AMOUNT, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new DeviceOrientationJsParamsConfig();

export class DeviceOrientationJsNode extends TypedJsNode<DeviceOrientationJsParamsConfig> {
	override paramsConfig = ParamsConfig;
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
		const smoothAmount = this.variableForInputParam(linesController, this.p.smoothAmount);
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
					func.asString(tmpVarName, smoothAmount)
				),
			]);
		}
	}
}

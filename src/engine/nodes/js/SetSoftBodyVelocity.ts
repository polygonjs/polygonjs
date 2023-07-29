/**
 * Update the soft body velocity
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {Poly} from '../../Poly';
import {inputObject3D, floatOutputFromParam} from './_BaseObject3D';
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class SetSoftBodyVelocityJsParamsConfig extends NodeParamsConfig {
	/** @param multiplier */
	mult = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetSoftBodyVelocityJsParamsConfig();

export class SetSoftBodyVelocityJsNode extends BaseTriggerAndObjectJsNode<SetSoftBodyVelocityJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_SOFT_BODY_VELOCITY;
	}

	protected override _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [new JsConnectionPoint('mult', JsConnectionPointType.FLOAT, CONNECTION_OPTIONS)];
	}

	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);

		floatOutputFromParam(this, this.p.mult, linesController);
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const mult = this.variableForInputParam(shadersCollectionController, this.p.mult);

		const func = Poly.namedFunctionsRegister.getFunction(
			'softBodyMultiplyVelocity',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, mult);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}

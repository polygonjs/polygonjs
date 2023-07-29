/**
 * Update the soft body position
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {Poly} from '../../Poly';
import {inputObject3D, vector3OutputFromParam, floatOutputFromParam} from './_BaseObject3D';
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class SetSoftBodyPositionJsParamsConfig extends NodeParamsConfig {
	/** @param target position */
	position = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetSoftBodyPositionJsParamsConfig();

export class SetSoftBodyPositionJsNode extends BaseTriggerAndObjectJsNode<SetSoftBodyPositionJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_SOFT_BODY_POSITION;
	}

	protected override _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint('position', JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint('lerp', JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
		];
	}

	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);

		vector3OutputFromParam(this, this.p.position, linesController);
		floatOutputFromParam(this, this.p.lerp, linesController);
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const position = this.variableForInputParam(shadersCollectionController, this.p.position);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction('softBodySetPosition', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, position, lerp);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}

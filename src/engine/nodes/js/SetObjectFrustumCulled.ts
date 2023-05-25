/**
 * Update the object frustumCulled state
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetObjectFrustumCulledJsParamsConfig extends NodeParamsConfig {
	/** @param target FrustumCulled state */
	frustumCulled = ParamConfig.BOOLEAN(true);
}
const ParamsConfig = new SetObjectFrustumCulledJsParamsConfig();

export class SetObjectFrustumCulledJsNode extends TypedJsNode<SetObjectFrustumCulledJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectFrustumCulled';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);
	}
	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const frustumCulled = this.variableForInputParam(shadersCollectionController, this.p.frustumCulled);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setObjectFrustumCulled',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, frustumCulled);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}

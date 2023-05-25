/**
 * Update the object receiveShadow state
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

class SetObjectReceiveShadowJsParamsConfig extends NodeParamsConfig {
	/** @param target ReceiveShadow state */
	receiveShadow = ParamConfig.BOOLEAN(true);
}
const ParamsConfig = new SetObjectReceiveShadowJsParamsConfig();

export class SetObjectReceiveShadowJsNode extends TypedJsNode<SetObjectReceiveShadowJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectReceiveShadow';
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
		const receiveShadow = this.variableForInputParam(shadersCollectionController, this.p.receiveShadow);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setObjectReceiveShadow',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, receiveShadow);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}

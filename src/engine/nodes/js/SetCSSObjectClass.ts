/**
 * Update the CSSObject class
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetCSSObjectClassJsParamsConfig extends NodeParamsConfig {
	/** @param class */
	class = ParamConfig.STRING('active');
	/** @param set to true to add the class, or false to remove */
	addRemove = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetCSSObjectClassJsParamsConfig();

export class SetCSSObjectClassJsNode extends TypedJsNode<SetCSSObjectClassJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setCSSObjectClass';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);
	}
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const className = this.variableForInputParam(linesController, this.p.class);
		const addRemove = this.variableForInputParam(linesController, this.p.addRemove);

		const func = Poly.namedFunctionsRegister.getFunction('setCSSObjectClass', this, linesController);
		const bodyLine = func.asString(object3D, className, addRemove);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}

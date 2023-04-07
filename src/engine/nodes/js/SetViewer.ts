/**
 * Update the viewer
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetViewerJsParamsConfig extends NodeParamsConfig {
	/** @param sets the class of the viewer */
	className = ParamConfig.STRING('active');
	/** @param set or unset */
	set = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetViewerJsParamsConfig();

export class SetViewerJsNode extends TypedJsNode<SetViewerJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setViewer';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const className = this.variableForInputParam(shadersCollectionController, this.p.className);
		const set = this.variableForInputParam(shadersCollectionController, this.p.set);

		const func = Poly.namedFunctionsRegister.getFunction('setViewer', this, shadersCollectionController);
		const bodyLine = func.asString(className, set);

		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}

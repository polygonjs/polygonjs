/**
 * Update the viewer controls
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetViewerControlsJsParamsConfig extends NodeParamsConfig {
	/** @param set or unset */
	active = ParamConfig.BOOLEAN(1);
	/** @param updateTarget */
	updateTarget = ParamConfig.BOOLEAN(0);
	/** @param target */
	target = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {updateTarget: 1},
	});
}
const ParamsConfig = new SetViewerControlsJsParamsConfig();

export class SetViewerControlsJsNode extends TypedJsNode<SetViewerControlsJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setViewerControls';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const active = this.variableForInputParam(shadersCollectionController, this.p.active);
		const updateTarget = this.variableForInputParam(shadersCollectionController, this.p.updateTarget);
		const target = this.variableForInputParam(shadersCollectionController, this.p.target);

		const func = Poly.namedFunctionsRegister.getFunction('setViewerControls', this, shadersCollectionController);
		const bodyLine = func.asString(active, updateTarget, target);

		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}

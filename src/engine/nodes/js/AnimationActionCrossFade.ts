/**
 * cross fades 2 AnimationActions
 *
 *
 */

import {TRIGGER_CONNECTION_NAME} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {TypedJsNode} from './_Base';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
export enum AnimationActionCrossFadeJsNodeInputName {
	FROM = 'from',
	TO = 'to',
}

class AnimationActionCrossFadeJsParamsConfig extends NodeParamsConfig {
	/** @param fadeIn duration */
	duration = ParamConfig.FLOAT(1);
	/** @param additional warping (gradually changes of the time scales) will be applied */
	warp = ParamConfig.BOOLEAN(1);
	/** @param starts cross fade when the from action ends */
	startOnFromActionEnd = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new AnimationActionCrossFadeJsParamsConfig();

export class AnimationActionCrossFadeJsNode extends TypedJsNode<AnimationActionCrossFadeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationActionCrossFade';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				AnimationActionCrossFadeJsNodeInputName.FROM,
				JsConnectionPointType.ANIMATION_ACTION,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				AnimationActionCrossFadeJsNodeInputName.TO,
				JsConnectionPointType.ANIMATION_ACTION,
				CONNECTION_OPTIONS
			),
		]);
	}
	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const actionFrom = this.variableForInput(
			shadersCollectionController,
			AnimationActionCrossFadeJsNodeInputName.FROM
		);
		const actionTo = this.variableForInput(shadersCollectionController, AnimationActionCrossFadeJsNodeInputName.TO);
		const duration = this.variableForInputParam(shadersCollectionController, this.p.duration);
		const warp = this.variableForInputParam(shadersCollectionController, this.p.warp);
		const startOnFromActionEnd = this.variableForInputParam(
			shadersCollectionController,
			this.p.startOnFromActionEnd
		);

		const func = Poly.namedFunctionsRegister.getFunction(
			'animationActionCrossFade',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(actionFrom, `()=>${actionTo}`, duration, warp, startOnFromActionEnd);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}

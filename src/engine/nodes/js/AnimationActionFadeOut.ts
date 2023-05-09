/**
 * fades out an AnimationAction
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {TRIGGER_CONNECTION_NAME} from './_Base';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
// import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
export class AnimationActionFadeOutJsParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	// trigger = ParamConfig.BUTTON(null, ACTOR_NODE_SELF_TRIGGER_CALLBACK);
	/** @param fadeIn duration */
	duration = ParamConfig.FLOAT(1);
}
const ParamsConfig = new AnimationActionFadeOutJsParamsConfig();

export class AnimationActionFadeOutJsNode extends TypedJsNode<AnimationActionFadeOutJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationActionFadeOut';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				JsConnectionPointType.ANIMATION_ACTION,
				JsConnectionPointType.ANIMATION_ACTION,
				CONNECTION_OPTIONS
			),
		]);
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const action = this.variableForInput(shadersCollectionController, JsConnectionPointType.ANIMATION_ACTION);
		const duration = this.variableForInputParam(shadersCollectionController, this.p.duration);

		const func = Poly.namedFunctionsRegister.getFunction(
			'animationActionFadeOut',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(action, duration);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}

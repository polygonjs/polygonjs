/**
 * fades in an AnimationAction
 *
 *
 */

import {
	TypedJsNode,
	// AnimationActionEventListenerExtended,
	// AnimationActionLoopEvent,
} from './_Base';
// import {AnimationMixer,EventListener, Event,AnimationAction} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TRIGGER_CONNECTION_NAME} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
// import {ParamType} from '../../poly/ParamType';
// import {getMostActiveAnimationActionFromMixer} from '../../../core/actor/AnimationMixerUtils';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class AnimationActionFadeInJsParamsConfig extends NodeParamsConfig {
	/** @param fadeIn duration */
	duration = ParamConfig.FLOAT(1);
	/** @param fade out other actions */
	fadeOutOtherActions = ParamConfig.BOOLEAN(1);
	/** @param additional warping (gradually changes of the time scales) will be applied */
	warp = ParamConfig.BOOLEAN(1, {
		visibleIf: {fadeOutOtherActions: 1},
	});
	/** @param starts cross fade when the from action ends */
	startOnFromActionEnd = ParamConfig.BOOLEAN(1, {
		visibleIf: {fadeOutOtherActions: 1},
	});
}
const ParamsConfig = new AnimationActionFadeInJsParamsConfig();

export class AnimationActionFadeInJsNode extends TypedJsNode<AnimationActionFadeInJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationActionFadeIn';
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
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const action = this.variableForInput(shadersCollectionController, JsConnectionPointType.ANIMATION_ACTION);
		const duration = this.variableForInputParam(shadersCollectionController, this.p.duration);
		const fadeOutOtherActions = this.variableForInputParam(shadersCollectionController, this.p.fadeOutOtherActions);
		const warp = this.variableForInputParam(shadersCollectionController, this.p.warp);
		const startOnFromActionEnd = this.variableForInputParam(
			shadersCollectionController,
			this.p.startOnFromActionEnd
		);

		const func = Poly.namedFunctionsRegister.getFunction(
			'animationActionFadeIn',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(action, duration, fadeOutOtherActions, warp, startOnFromActionEnd);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}

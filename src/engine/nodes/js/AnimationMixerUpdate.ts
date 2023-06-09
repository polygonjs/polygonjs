/**
 * create an animation mixer from an object that contains animation tracks
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {JsType} from '../../poly/registers/nodes/types/Js';
// import {Object3D} from 'three';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class AnimationMixerUpdateJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new AnimationMixerUpdateJsParamsConfig();

export class AnimationMixerUpdateJsNode extends TypedJsNode<AnimationMixerUpdateJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ANIMATION_MIXER_UPDATE;
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				JsConnectionPointType.ANIMATION_MIXER,
				JsConnectionPointType.ANIMATION_MIXER,
				CONNECTION_OPTIONS
			),
		]);
	}
	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const func = Poly.namedFunctionsRegister.getFunction('animationMixerUpdate', this, shadersCollectionController);
		const bodyLine = func.asString(object3D);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}

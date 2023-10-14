/**
 * sends a trigger when an object is hovered
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseUserInputJsNode} from './_BaseUserInput';
import {CoreEventEmitter} from '../../../core/event/CoreEventEmitter';
import {JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint} from '../utils/io/connections/Js';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class BaseOnObjectPointerEventJsParamsConfig extends NodeParamsConfig {
	/** @param include children */
	traverseChildren = ParamConfig.BOOLEAN(1);
	/** @param pointsThreshold */
	pointsThreshold = ParamConfig.FLOAT(0.1);
	/** @param lineThreshold */
	lineThreshold = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new BaseOnObjectPointerEventJsParamsConfig();

export abstract class ExtendableOnObjectPointerEventJsNode<
	T extends BaseOnObjectPointerEventJsParamsConfig
> extends BaseUserInputJsNode<T> {
	override isTriggering() {
		return true;
	}
	override eventEmitter() {
		return CoreEventEmitter.CANVAS;
	}
	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.connection_points.spare_params.setInputlessParamNames(['pointsThreshold', 'lineThreshold', 'element']);
	}
	protected _additionalInputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [];
	}
}
export abstract class BaseOnObjectPointerEventJsNode extends ExtendableOnObjectPointerEventJsNode<BaseOnObjectPointerEventJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
}

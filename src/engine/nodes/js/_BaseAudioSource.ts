import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {NodeContext} from '../../poly/NodeContext';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class PauseAudioSourceJsParamsConfig extends NodeParamsConfig {
	/** @param audio node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
		},
		// dependentOnFoundNode: false,
	});
}
const ParamsConfig = new PauseAudioSourceJsParamsConfig();

export abstract class BaseAudioSourceJsNode extends TypedJsNode<PauseAudioSourceJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
}

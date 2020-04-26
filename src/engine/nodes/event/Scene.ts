import {ACCEPTED_SCENE_EVENT_TYPES} from '../../scene/utils/events/SceneEventsController';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
class SceneEventParamsConfig extends NodeParamsConfig {
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			SceneEventNode.PARAM_CALLBACK_update_register(node as SceneEventNode);
		},
	});
	sep = ParamConfig.SEPARATOR(null, {visible_if: {active: true}});
	scene_loaded = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	play = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	pause = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	tick = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
}
const ParamsConfig = new SceneEventParamsConfig();

export class SceneEventNode extends TypedInputEventNode<SceneEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'scene';
	}
	protected accepted_event_types() {
		return ACCEPTED_SCENE_EVENT_TYPES.map((n) => `${n}`);
	}
	initialize_node() {
		this.io.outputs.set_named_output_connection_points(
			ACCEPTED_SCENE_EVENT_TYPES.map((event_type) => {
				return new EventConnectionPoint(event_type, EventConnectionPointType.BASE);
			})
		);
	}
}

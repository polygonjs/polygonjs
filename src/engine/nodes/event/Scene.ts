/**
 * Sends events related to the scene
 *
 *
 */
import {ACCEPTED_SCENE_EVENT_TYPES} from '../../scene/utils/events/SceneEventsController';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {EventConnectionPoint, EventConnectionPointType, BaseEventConnectionPoint} from '../utils/io/connections/Event';
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from './_BaseInput';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';

enum SceneNodeInput {
	SET_FRAME = 'setFrame',
}
enum SceneNodeOutput {
	TIME_REACHED = 'timeReached',
}
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
class SceneEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			SceneEventNode.PARAM_CALLBACK_update_register(node as SceneEventNode);
		},
	});
	sep = ParamConfig.SEPARATOR(null, {visibleIf: {active: true}});
	/** @param toggle on to trigger an event when the scene has loaded. This can be useful to initialize other nodes */
	sceneLoaded = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to trigger an event when the scene starts playing */
	play = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to trigger an event when the scene pauses */
	pause = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	/** @param toggle on to trigger an event on every tick */
	tick = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
	sep0 = ParamConfig.SEPARATOR();
	/** @param toggle on to trigger an event on every tick */
	treachedTime = ParamConfig.BOOLEAN(0, {
		callback: (node: BaseNodeType) => {
			SceneEventNode.PARAM_CALLBACK_update_time_dependency(node as SceneEventNode);
		},
	});
	/** @param time to trigger an event */
	reachedTime = ParamConfig.INTEGER(10, {
		visibleIf: {treachedTime: 1},
		range: [0, 100],
	});
	sep1 = ParamConfig.SEPARATOR();
	/** @param frame to set */
	setFrameValue = ParamConfig.INTEGER(1, {
		range: [0, 100],
	});
	/** @param button to set a specific frame */
	setFrame = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			SceneEventNode.PARAM_CALLBACK_setFrame(node as SceneEventNode);
		},
	});
}
const ParamsConfig = new SceneEventParamsConfig();

export class SceneEventNode extends TypedInputEventNode<SceneEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'scene';
	}

	private graph_node: CoreGraphNode | undefined;

	protected accepted_event_types() {
		return ACCEPTED_SCENE_EVENT_TYPES.map((n) => `${n}`);
	}
	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(
				SceneNodeInput.SET_FRAME,
				EventConnectionPointType.BASE,
				this.onSetFrame.bind(this)
			),
		]);
		const out_connection_points: BaseEventConnectionPoint[] = ACCEPTED_SCENE_EVENT_TYPES.map((event_type) => {
			return new EventConnectionPoint(event_type, EventConnectionPointType.BASE);
		});
		out_connection_points.push(
			new EventConnectionPoint(SceneNodeOutput.TIME_REACHED, EventConnectionPointType.BASE)
		);
		this.io.outputs.set_named_output_connection_points(out_connection_points);

		this.params.on_params_created('update_time_dependency', () => {
			this.update_time_dependency();
		});
	}

	private onSetFrame(event_context: EventContext<Event>) {
		this.scene.setFrame(this.pv.setFrameValue);
	}

	private on_frame_update() {
		if (this.scene.time >= this.pv.reachedTime) {
			this.dispatch_event_to_output(SceneNodeOutput.TIME_REACHED, {});
		}
	}
	private update_time_dependency() {
		if (this.pv.treachedTime) {
			this.graph_node = this.graph_node || new CoreGraphNode(this.scene, 'scene_node_time_graph_node');
			this.graph_node.add_graph_input(this.scene.timeController.graph_node);
			this.graph_node.add_post_dirty_hook('time_update', this.on_frame_update.bind(this));
		} else {
			if (this.graph_node) {
				this.graph_node.graph_disconnect_predecessors();
			}
		}
	}
	static PARAM_CALLBACK_setFrame(node: SceneEventNode) {
		node.onSetFrame({});
	}
	static PARAM_CALLBACK_update_time_dependency(node: SceneEventNode) {
		node.update_time_dependency();
	}
}

import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {AnimationMixer} from 'three/src/animation/AnimationMixer';
import {AnimationAction} from 'three/src/animation/AnimationAction';
import {BaseObjNodeType} from '../obj/_Base';
import {BaseAnimNodeType} from '../anim/_Base';
import {LoopOnce, LoopRepeat} from 'three/src/constants';

enum AnimationEventInput {
	START = 'start',
	STOP = 'stop',
	UPDATE = 'update',
}
enum AnimationEventOutput {
	START = 'start',
	STOP = 'stop',
}
enum AnimationClipLoopType {
	REPEAT = 'repeat',
	// PING_PONG = 'ping pong', // ping pong does not seem to work (it flickers)
	ONCE = 'once',
}
const ANIMATION_CLIP_LOOP_TYPES: AnimationClipLoopType[] = [
	AnimationClipLoopType.REPEAT,
	// AnimationClipLoopType.PING_PONG,
	AnimationClipLoopType.ONCE,
];
const THREE_LOOP_TYPES = {
	[AnimationClipLoopType.REPEAT]: LoopRepeat,
	// [AnimationClipLoopType.PING_PONG]: LoopPingPong,
	[AnimationClipLoopType.ONCE]: LoopOnce,
};

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AnimationEventParamsConfig extends NodeParamsConfig {
	object = ParamConfig.OPERATOR_PATH('/geo1', {
		node_selection: {context: NodeContext.OBJ},
		dependent_on_found_node: false,
	});
	// time = ParamConfig.FLOAT('$T', {cook: false});
	start = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AnimationEventNode.PARAM_CALLBACK_start_animation(node as AnimationEventNode);
		},
	});
	stop = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AnimationEventNode.PARAM_CALLBACK_stop_animation(node as AnimationEventNode);
		},
	});
	animation = ParamConfig.OPERATOR_PATH('/ANIM/OUT', {
		node_selection: {context: NodeContext.ANIM},
		dependent_on_found_node: false,
	});
	loop = ParamConfig.INTEGER(ANIMATION_CLIP_LOOP_TYPES.indexOf(AnimationClipLoopType.REPEAT), {
		menu: {
			entries: ANIMATION_CLIP_LOOP_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
	});
}
const ParamsConfig = new AnimationEventParamsConfig();

export class AnimationEventNode extends TypedEventNode<AnimationEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'animation';
	}

	private _resolved_anim_node: BaseAnimNodeType | undefined;
	private _resolved_object_node: BaseObjNodeType | undefined;
	private _animation_mixer: AnimationMixer | undefined;
	private _animation_action: AnimationAction | undefined;

	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(
				AnimationEventInput.START,
				EventConnectionPointType.BASE,
				this._start_animation.bind(this)
			),
			new EventConnectionPoint(
				AnimationEventInput.STOP,
				EventConnectionPointType.BASE,
				this._stop_animation.bind(this)
			),
			new EventConnectionPoint(
				AnimationEventInput.UPDATE,
				EventConnectionPointType.BASE,
				this._update_animation.bind(this)
			),
		]);

		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(AnimationEventOutput.START, EventConnectionPointType.BASE),
			new EventConnectionPoint(AnimationEventOutput.STOP, EventConnectionPointType.BASE),
		]);
	}
	cook() {
		this._update_object_node();
		this._update_animation_node();
		this._prepare_animation_mixer();

		this.cook_controller.end_cook();
	}

	process_event(event_context: EventContext<Event>) {
		// this.dispatch_event_to_output(OUTPUT_NAME, event_context);
	}

	static PARAM_CALLBACK_start_animation(node: AnimationEventNode) {
		node._start_animation();
	}
	static PARAM_CALLBACK_stop_animation(node: AnimationEventNode) {
		node._stop_animation();
	}

	// static PARAM_CALLBACK_update_animation_node(node: AnimationEventNode) {
	// 	node._update_animation_node();
	// }
	// static PARAM_CALLBACK_update_object_node(node: AnimationEventNode) {
	// 	node._update_object_node();
	// }

	private _start_time: number = 0;
	private _start_animation() {
		if (this._animation_action) {
			this._animation_action.play();
			this._start_time = this.scene.time;
		}
	}
	private _stop_animation() {
		if (this._animation_action) {
			this._animation_action.stop();
		}
	}
	private _update_animation() {
		if (this._animation_mixer) {
			const elapsed_time = this.scene.time - this._start_time;
			this._animation_mixer.setTime(elapsed_time);
		}
	}

	private async _update_animation_node() {
		const param = this.p.animation;
		if (param.is_dirty) {
			await param.compute();
		}
		this._resolved_anim_node = param.found_node_with_context(NodeContext.ANIM);
	}
	private async _update_object_node() {
		const param = this.p.object;
		if (param.is_dirty) {
			await param.compute();
		}
		this._resolved_object_node = param.found_node_with_context(NodeContext.OBJ);
	}

	private async _prepare_animation_mixer() {
		if (!this._resolved_anim_node || !this._resolved_object_node) {
			this._animation_mixer = undefined;
			return;
		}

		const object = this._resolved_object_node.object;
		const clip = this._resolved_anim_node.clip;
		if (this._resolved_anim_node.is_dirty) {
			await this._resolved_anim_node.request_container();
		}

		if (this._animation_mixer) {
			if (this._animation_mixer.getRoot().uuid != object.uuid) {
				this._animation_mixer = undefined;
			}
		}
		this._animation_mixer = this._animation_mixer || new AnimationMixer(object);
		this._animation_action = this._animation_mixer.clipAction(clip);

		const loop = THREE_LOOP_TYPES[ANIMATION_CLIP_LOOP_TYPES[this.pv.loop]];
		this._animation_action.setLoop(loop, Infinity);
		this._animation_action.clampWhenFinished = true;
		// this._animation_action.zeroSlopeAtEnd = true;
		// this._animation_action.zeroSlopeAtStart = true;
	}
}

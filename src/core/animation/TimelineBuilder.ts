import {TimelineBuilderProperty} from './TimelineBuilderProperty';
import {PolyScene} from '../../engine/scene/PolyScene';
import {PropertyTarget} from './PropertyTarget';
import {AnimationPosition} from './Position';
import {AnimationUpdateCallback} from './UpdateCallback';

export enum Operation {
	SET = 'set',
	ADD = 'add',
	SUBSTRACT = 'substract',
}
export const OPERATIONS: Operation[] = [Operation.SET, Operation.ADD, Operation.SUBSTRACT];

export interface AnimationRepeatParams {
	count: number;
	delay: number;
	yoyo: boolean;
}

export class TimelineBuilder {
	private _timeline_builders: TimelineBuilder[] = [];
	private _parent: TimelineBuilder | undefined;
	private _target: PropertyTarget | undefined;
	private _duration: number = 1;
	private _easing: string | undefined;
	private _operation: Operation = Operation.SET;
	private _repeat_params: AnimationRepeatParams | undefined;
	private _delay: number = 0;
	private _position: AnimationPosition | undefined;
	private _property: TimelineBuilderProperty | undefined;
	private _update_callback: AnimationUpdateCallback | undefined;

	// static __next_id = 0;
	// private _id: number = (TimelineBuilder.__next_id += 1);
	// constructor() {
	// 	console.log('new builder', this._id);
	// }

	add_timeline_builder(timeline_builder: TimelineBuilder) {
		this._timeline_builders.push(timeline_builder);
		timeline_builder.set_parent(this);
	}
	timeline_builders() {
		return this._timeline_builders;
	}
	set_parent(parent: TimelineBuilder) {
		this._parent = parent;
	}
	parent() {
		return this._parent;
	}

	set_target(target: PropertyTarget) {
		this._target = target;
		for (let builder of this._timeline_builders) {
			builder.set_target(target);
		}
	}
	target() {
		return this._target;
	}
	set_duration(duration: number) {
		if (duration >= 0) {
			this._duration = duration;
			for (let builder of this._timeline_builders) {
				builder.set_duration(duration);
			}
		}
	}
	duration() {
		return this._duration;
	}
	set_easing(easing: string) {
		this._easing = easing;
		for (let builder of this._timeline_builders) {
			builder.set_easing(easing);
		}
	}
	easing() {
		return this._easing;
	}
	set_operation(operation: Operation) {
		this._operation = operation;
		for (let builder of this._timeline_builders) {
			builder.set_operation(operation);
		}
	}
	operation() {
		return this._operation;
	}
	set_repeat_params(repeat_params: AnimationRepeatParams) {
		this._repeat_params = repeat_params;
		for (let builder of this._timeline_builders) {
			builder.set_repeat_params(repeat_params);
		}
	}
	repeat_params() {
		return this._repeat_params;
	}
	set_delay(delay: number) {
		this._delay = delay;
		for (let builder of this._timeline_builders) {
			builder.set_delay(delay);
		}
	}
	delay() {
		return this._delay;
	}
	set_position(position: AnimationPosition | undefined) {
		this._position = position;
		for (let builder of this._timeline_builders) {
			builder.set_position(position);
		}
	}
	position() {
		return this._position;
	}
	set_update_callback(update_callback: AnimationUpdateCallback) {
		this._update_callback = update_callback;
	}
	update_callback() {
		return this._update_callback;
	}
	// merge(timeline_builder?: TimelineBuilder) {
	// 	if (!timeline_builder) {
	// 		return;
	// 	}
	// }
	clone() {
		const new_timeline_builder = new TimelineBuilder();
		new_timeline_builder.set_duration(this._duration);
		new_timeline_builder.set_operation(this._operation);
		new_timeline_builder.set_delay(this._delay);

		if (this._target) {
			new_timeline_builder.set_target(this._target.clone());
		}
		if (this._easing) {
			new_timeline_builder.set_easing(this._easing);
		}
		if (this._delay) {
			new_timeline_builder.set_delay(this._delay);
		}
		if (this._update_callback) {
			new_timeline_builder.set_update_callback(this._update_callback.clone());
		}
		if (this._repeat_params) {
			new_timeline_builder.set_repeat_params({
				count: this._repeat_params.count,
				delay: this._repeat_params.delay,
				yoyo: this._repeat_params.yoyo,
			});
		}
		if (this._property) {
			new_timeline_builder.set_property(this._property);
		}
		if (this._position) {
			new_timeline_builder.set_position(this._position.clone());
		}
		for (let child_timeline_builder of this._timeline_builders) {
			const new_child_timeline_builder = child_timeline_builder.clone();
			new_timeline_builder.add_timeline_builder(new_child_timeline_builder);
		}
		return new_timeline_builder;
	}
	// debug() {
	// 	return [
	// 		this._target_mask,
	// 		this._property?.name(),
	// 		this._timeline_builders.length,
	// 		this._timeline_builders.map((tb) => tb._property?.name()),
	// 	];
	// }
	// copy(timeline_builder: TimelineBuilder) {
	// 	let property: TimelineBuilderProperty;
	// 	while ((property = this._properties[0])) {
	// 		this._properties.pop();
	// 	}
	// 	for (property of timeline_builder.properties()) {
	// 		const new_property = property.clone();
	// 		this._properties.push(new_property);
	// 	}
	// }

	set_property(property: TimelineBuilderProperty) {
		this._property = property;
	}
	// add_property(property: TimelineBuilderProperty) {
	// 	this._properties.push(property);
	// }
	// properties() {
	// 	return this._properties;
	// }

	populate(timeline: gsap.core.Timeline, scene: PolyScene) {
		for (let timeline_builder of this._timeline_builders) {
			timeline_builder.populate(timeline, scene);
		}

		if (this._property && this._target) {
			this._property.add_to_timeline(this, scene, timeline, this._target);
		}

		// const camera_node = scene.root.nodes_by_type('perspective_camera')[0];
		// const controls_nodes = scene.nodes_controller.instanciated_nodes(NodeContext.EVENT, 'camera_orbit_controls');
		// const controls_node = controls_nodes[0];
		// const camera_proxy = camera_node.pv.t.clone();
		// const controls_proxy = controls_node.pv.target.clone();
		// const camera_t_array: Number3 = camera_proxy.toArray() as Number3;
		// const target_array: Number3 = controls_proxy.toArray() as Number3;
		// timeline.to(camera_proxy, {
		// 	duration: 1,
		// 	x: camera_proxy.x + 1,
		// 	z: camera_proxy.z + 1,
		// });
		// timeline.to(
		// 	controls_proxy,
		// 	{
		// 		duration: 1,
		// 		x: controls_proxy.x + 1,
		// 		z: controls_proxy.z + 1,
		// 		onUpdate: () => {
		// 			scene.cooker.block();
		// 			camera_proxy.toArray(camera_t_array);
		// 			controls_proxy.toArray(target_array);
		// 			camera_node.p.t.set(camera_t_array);
		// 			controls_node.p.target.set(target_array);
		// 			scene.cooker.unblock();
		// 		},
		// 	},
		// 	0
		// );

		// // t2.pause();
		// t2.to(object.position, {duration: 1, y: object.position.y + 1, ease: 'power2.out'});
		// t2.to(object.scale, {duration: 1, z: object.scale.z + 1, ease: 'power2.out'}, 0);

		// const t1 = gsap.timeline();
		// t1.to(object.position, {duration: 1, x: object.position.x + 1, ease: 'power2.out'});
		// t1.to(object.rotation, {duration: 1, y: object.rotation.y + Math.PI, ease: 'power2.out'}, 0)
		// const timeline = gsap.timeline({
		// 	onComplete: () => {
		// 		console.log('timeline completed');
		// 	},
		// });
		// timeline.add(t1);
		// timeline.add(t2);
	}
}

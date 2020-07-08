import lodash_isNumber from 'lodash/isNumber';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {Object3D} from 'three/src/core/Object3D';
import {TimelineBuilder, Operation} from './TimelineBuilder';
import {PropertyTarget} from './PropertyTarget';
import {PolyScene} from '../../engine/scene/PolyScene';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {BaseParamType} from '../../engine/params/_Base';
import {ParamType} from '../../engine/poly/ParamType';
import {FloatParam} from '../../engine/params/Float';
import {Vector2Param} from '../../engine/params/Vector2';
import {Vector3Param} from '../../engine/params/Vector3';
import {Vector4Param} from '../../engine/params/Vector4';
import {TypeAssert} from '../../engine/poly/Assert';
import {AnimNodeEasing} from '../../engine/nodes/anim/Easing';

export type AnimPropertyTargetValue = number | Vector2 | Vector3 | Vector4;

interface Object3DProps {
	target_property: AnimPropertyTargetValue;
	to_target: object;
	property_names: string[];
}

const PROPERTY_SEPARATOR = '.';

export class TimelineBuilderProperty {
	private _property_name: string | undefined;
	private _target_value: AnimPropertyTargetValue | undefined;
	constructor() {}
	set_name(name: string) {
		this._property_name = name;
	}
	set_target_value(value: AnimPropertyTargetValue) {
		this._target_value = value;
	}
	name() {
		return this._property_name;
	}
	target_value() {
		return this._target_value;
	}

	clone() {
		const cloned = new TimelineBuilderProperty();
		if (this._property_name) {
			cloned.set_name(this._property_name);
		}
		if (this._target_value != null) {
			const new_target_value = lodash_isNumber(this._target_value)
				? this._target_value
				: this._target_value.clone();
			cloned.set_target_value(new_target_value);
		}

		return cloned;
	}

	add_to_timeline(
		timeline_builder: TimelineBuilder,
		scene: PolyScene,
		timeline: gsap.core.Timeline,
		target: PropertyTarget
	) {
		const objects = target.objects(scene);
		if (objects) {
			this._populate_with_objects(objects, timeline_builder, timeline);
		} else {
			const node = target.node(scene);
			if (node) {
				this._populate_with_node(node, timeline_builder, timeline);
			}
		}
	}
	private _populate_with_objects(
		objects: Object3D[],
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._property_name && this._target_value != null)) {
			return;
		}
		const operation = timeline_builder.operation();
		const update_callback = timeline_builder.update_callback();

		for (let object3d of objects) {
			// const target_property = (object3d as any)[this._property_name as any] as TargetValue;
			// let to_target: object | null = null;
			const props = this._scene_graph_props(object3d, this._property_name);
			if (props) {
				const target_property = props.target_property;
				const to_target = props.to_target;
				const property_names = props.property_names;
				const vars = this._common_vars(timeline_builder);

				// add update_matrix
				if (update_callback && update_callback.update_matrix()) {
					const old_matrix_auto_update = object3d.matrixAutoUpdate;
					vars.onStart = () => {
						object3d.matrixAutoUpdate = true;
					};
					vars.onComplete = () => {
						object3d.matrixAutoUpdate = old_matrix_auto_update;
					};
				}

				if (lodash_isNumber(this._target_value)) {
					if (lodash_isNumber(target_property)) {
						for (let property_name of property_names) {
							vars[property_name] = this.with_op(target_property, this._target_value, operation);
						}
					}
				} else {
					if (!lodash_isNumber(target_property)) {
						for (let property_name of property_names) {
							vars[property_name] = this.with_op(
								target_property[property_name as 'x'],
								this._target_value[property_name as 'x'],
								operation
							);
						}
					}
				}

				if (to_target) {
					this._start_timeline(timeline_builder, timeline, vars, to_target);
				}
			}
		}
	}
	private _scene_graph_props(object: object, property_name: string): Object3DProps | undefined {
		const elements = property_name.split(PROPERTY_SEPARATOR);
		if (elements.length > 1) {
			const first_element = elements.shift() as string;
			const sub_object = (object as any)[first_element as any] as object;
			if (sub_object) {
				const sub_property_name = elements.join(PROPERTY_SEPARATOR);
				return this._scene_graph_props(sub_object, sub_property_name);
			}
		} else {
			const target_property = (object as any)[property_name as any] as AnimPropertyTargetValue;
			let to_target: object | null = null;
			const property_names: string[] = [];
			if (lodash_isNumber(target_property)) {
				to_target = object;
				property_names.push(property_name);
			} else {
				to_target = target_property;
				if (this._target_value instanceof Vector2) {
					property_names.push('x', 'y');
				}
				if (this._target_value instanceof Vector3) {
					property_names.push('x', 'y', 'z');
				}
				if (this._target_value instanceof Vector4) {
					property_names.push('x', 'y', 'z', 'w');
				}
			}
			return {
				target_property: target_property,
				to_target: to_target,
				property_names: property_names,
			};
		}
	}

	private _populate_with_node(node: BaseNodeType, timeline_builder: TimelineBuilder, timeline: gsap.core.Timeline) {
		const target_param = node.p[this._property_name as any] as BaseParamType;
		if (!target_param) {
			return;
		}

		if (target_param) {
			this._populate_vars_for_param(target_param, timeline_builder, timeline);
		}
	}
	private _populate_vars_for_param(
		param: BaseParamType,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		switch (param.type) {
			case ParamType.FLOAT: {
				this._populate_vars_for_param_float(param as FloatParam, timeline_builder, timeline);
			}
			case ParamType.VECTOR2: {
				this._populate_vars_for_param_vector2(param as Vector2Param, timeline_builder, timeline);
			}
			case ParamType.VECTOR3: {
				this._populate_vars_for_param_vector3(param as Vector3Param, timeline_builder, timeline);
			}
			case ParamType.VECTOR4: {
				this._populate_vars_for_param_vector4(param as Vector4Param, timeline_builder, timeline);
			}
		}
	}
	private _populate_vars_for_param_float(
		param: FloatParam,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!lodash_isNumber(this._target_value)) {
			return;
		}
		const vars = this._common_vars(timeline_builder);
		const proxy = {num: param.value};
		vars.onUpdate = () => {
			param.set(proxy.num);
		};
		const operation = timeline_builder.operation();
		vars.num = this.with_op(param.value, this._target_value, operation);
		this._start_timeline(timeline_builder, timeline, vars, proxy);
	}
	private _populate_vars_for_param_vector2(
		param: Vector2Param,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._target_value instanceof Vector2)) {
			return;
		}
		const vars = this._common_vars(timeline_builder);
		const proxy = param.value.clone();
		const proxy_array: Number2 = [0, 0];
		vars.onUpdate = () => {
			proxy.toArray(proxy_array);
			param.set(proxy_array);
		};
		const operation = timeline_builder.operation();
		vars.x = this.with_op(param.value.x, this._target_value.x, operation);
		vars.y = this.with_op(param.value.y, this._target_value.y, operation);
		this._start_timeline(timeline_builder, timeline, vars, proxy);
	}
	private _populate_vars_for_param_vector3(
		param: Vector3Param,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._target_value instanceof Vector3)) {
			return;
		}
		const vars = this._common_vars(timeline_builder);
		const proxy = param.value.clone();
		const proxy_array: Number3 = [0, 0, 0];
		vars.onUpdate = () => {
			proxy.toArray(proxy_array);
			param.set(proxy_array);
		};
		const operation = timeline_builder.operation();
		vars.x = this.with_op(param.value.x, this._target_value.x, operation);
		vars.y = this.with_op(param.value.y, this._target_value.y, operation);
		vars.z = this.with_op(param.value.z, this._target_value.z, operation);
		this._start_timeline(timeline_builder, timeline, vars, proxy);
	}

	private _populate_vars_for_param_vector4(
		param: Vector4Param,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._target_value instanceof Vector4)) {
			return;
		}
		const vars = this._common_vars(timeline_builder);
		const proxy = param.value.clone();
		const proxy_array: Number4 = [0, 0, 0, 0];
		vars.onUpdate = () => {
			proxy.toArray(proxy_array);
			param.set(proxy_array);
		};
		const operation = timeline_builder.operation();
		vars.x = this.with_op(param.value.x, this._target_value.x, operation);
		vars.y = this.with_op(param.value.y, this._target_value.y, operation);
		vars.z = this.with_op(param.value.z, this._target_value.z, operation);
		vars.w = this.with_op(param.value.w, this._target_value.w, operation);
		this._start_timeline(timeline_builder, timeline, vars, proxy);
	}

	private with_op(current_value: number, value: number, operation: Operation) {
		switch (operation) {
			case Operation.SET:
				return value;
			case Operation.ADD:
				return current_value + value;
			case Operation.SUBSTRACT:
				return current_value - value;
		}
		TypeAssert.unreachable(operation);
	}
	private _common_vars(timeline_builder: TimelineBuilder) {
		const duration = timeline_builder.duration();
		const vars: gsap.TweenVars = {duration: duration};

		// easing
		const easing = timeline_builder.easing() || AnimNodeEasing.NONE;
		if (easing) {
			vars.ease = easing;
		}

		// delay
		const delay = timeline_builder.delay();
		if (delay != null) {
			vars.delay = delay;
		}

		// repeat
		const repeat_params = timeline_builder.repeat_params();
		if (repeat_params) {
			vars.repeat = repeat_params.count;
			vars.repeatDelay = repeat_params.delay;
			vars.yoyo = repeat_params.yoyo;
		}

		return vars;
	}
	private _start_timeline(
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline,
		vars: gsap.TweenVars,
		target: object
	) {
		const position = timeline_builder.position();
		const position_param = position ? position.to_parameter() : undefined;
		timeline.to(target, vars, position_param);
	}
}

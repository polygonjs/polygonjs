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

type TargetValue = number | Vector2 | Vector3 | Vector4;

export class TimelineBuilderProperty {
	constructor(private _property_name: string, private _target_value: TargetValue, private _update_matrix: boolean) {}
	name() {
		return this._property_name;
	}
	target_value() {
		return this._target_value;
	}

	clone() {
		const new_target_value = lodash_isNumber(this._target_value) ? this._target_value : this._target_value.clone();
		return new TimelineBuilderProperty(this._property_name, new_target_value, this._update_matrix);
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
		const operation = timeline_builder.operation();

		for (let object3d of objects) {
			const target_property = (object3d as any)[this._property_name as any] as TargetValue;
			let to_target: object | null = null;
			if (target_property) {
				const vars = this._common_vars(timeline_builder);

				// add update_matrix
				if (this._update_matrix) {
					vars.onUpdateParams = [object3d];
					vars.onUpdate = (object3d: Object3D) => {
						object3d.updateMatrix();
					};
				}

				// add update_matrix
				if (lodash_isNumber(this._target_value)) {
					if (lodash_isNumber(target_property)) {
						vars[this._property_name] = this.with_op(target_property, this._target_value, operation);
						to_target = object3d;
					}
				} else {
					if (!lodash_isNumber(target_property)) {
						to_target = target_property;
						vars['x'] = this.with_op(target_property.x, this._target_value.x, operation);
						vars['y'] = this.with_op(target_property.x, this._target_value.x, operation);
						if (this._target_value instanceof Vector3 && target_property instanceof Vector3) {
							vars['z'] = this.with_op(target_property.z, this._target_value.z, operation);
						} else {
							if (this._target_value instanceof Vector4 && target_property instanceof Vector4) {
								vars['z'] = this.with_op(target_property.z, this._target_value.z, operation);
								vars['w'] = this.with_op(target_property.w, this._target_value.w, operation);
							}
						}
					}
				}
				if (to_target) {
					timeline.to(to_target, vars, 0);
				}
			}
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
		timeline.to(proxy, vars, 0);
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
		timeline.to(proxy, vars, 0);
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
		console.log('operation', operation, param.name);
		vars.x = this.with_op(param.value.x, this._target_value.x, operation);
		vars.y = this.with_op(param.value.y, this._target_value.y, operation);
		vars.z = this.with_op(param.value.z, this._target_value.z, operation);
		console.log(proxy.x, this._target_value.clone().x, vars);
		timeline.to(proxy, vars, 0);
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
		timeline.to(proxy, vars, 0);
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
		const easing = timeline_builder.easing();
		const vars: gsap.TweenVars = {duration: duration};

		// add easing
		if (easing) {
			vars.ease = easing;
		}
		return vars;
	}
}

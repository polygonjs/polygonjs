import {Number2, Number3, Number4} from '../../types/GlobalTypes';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {Quaternion} from 'three/src/math/Quaternion';
import {Object3D} from 'three/src/core/Object3D';
import {TimelineBuilder, Operation} from './TimelineBuilder';
import {PropertyTarget} from './PropertyTarget';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {BaseParamType} from '../../engine/params/_Base';
import {ParamType} from '../../engine/poly/ParamType';
import {FloatParam} from '../../engine/params/Float';
import {Vector2Param} from '../../engine/params/Vector2';
import {Vector3Param} from '../../engine/params/Vector3';
import {Vector4Param} from '../../engine/params/Vector4';
import {TypeAssert} from '../../engine/poly/Assert';
import {AnimNodeEasing} from './Constant';
import {Poly} from '../../engine/Poly';
import {CoreType} from '../Type';

export type AnimPropertyTargetValue = number | Vector2 | Vector3 | Vector4 | Quaternion;

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
	setName(name: string) {
		this._property_name = name;
	}
	setTargetValue(value: AnimPropertyTargetValue) {
		this._target_value = value;
	}
	name() {
		return this._property_name;
	}
	targetValue() {
		return this._target_value;
	}

	private _debug = false;
	setDebug(debug: boolean) {
		this._debug = debug;
	}
	private _printDebug(message: any) {
		if (!this._debug) {
			return;
		}
		console.log(message);
	}

	clone() {
		const cloned = new TimelineBuilderProperty();
		if (this._property_name) {
			cloned.setName(this._property_name);
		}
		if (this._target_value != null) {
			const new_target_value = CoreType.isNumber(this._target_value)
				? this._target_value
				: this._target_value.clone();
			cloned.setTargetValue(new_target_value);
		}

		return cloned;
	}

	addToTimeline(timeline_builder: TimelineBuilder, timeline: gsap.core.Timeline, target: PropertyTarget) {
		const objects = target.objects();
		if (objects) {
			this._populateWithObjects(objects, timeline_builder, timeline);
		}
		const node = target.node();
		if (node) {
			this._populateWithNode(node, timeline_builder, timeline);
		}
	}
	private _populateWithObjects(objects: Object3D[], timeline_builder: TimelineBuilder, timeline: gsap.core.Timeline) {
		this._printDebug(['_populateWithObjects', objects]);
		if (!this._property_name) {
			Poly.warn('no property name given');
			return;
		}
		if (this._target_value == null) {
			Poly.warn('no target value given');
			return;
		}
		const operation = timeline_builder.operation();
		const update_callback = timeline_builder.updateCallback();

		for (let object3d of objects) {
			// const target_property = (object3d as any)[this._property_name as any] as TargetValue;
			// let to_target: object | null = null;
			const props = this._sceneGraphProps(object3d, this._property_name);
			if (props) {
				let {target_property, to_target, property_names} = props;
				const vars = this._commonVars(timeline_builder);

				// add update_matrix
				if (update_callback && update_callback.updateMatrix()) {
					const old_matrix_auto_update = object3d.matrixAutoUpdate;
					vars.onStart = () => {
						object3d.matrixAutoUpdate = true;
					};
					vars.onComplete = () => {
						object3d.matrixAutoUpdate = old_matrix_auto_update;
						// we still need to update the matrix manually here,
						// as (it is specially noticeable on short animations)
						// the last step of the timeline will not have the matrix updated
						// and the object will therefore look like it has not fully completed
						// its animation.
						if (!object3d.matrixAutoUpdate) {
							object3d.updateMatrix();
						}
					};
				}
				// handle quaternions as a special case
				if (target_property instanceof Quaternion && this._target_value instanceof Quaternion) {
					const proxy = {value: 0};
					const qTarget = target_property;
					const qStart = new Quaternion().copy(target_property);
					const qEnd = this._target_value;
					vars.onUpdate = () => {
						Quaternion.slerp(qStart, qEnd, qTarget, proxy.value);
					};
					to_target = proxy;
					vars.value = 1;
				}

				if (CoreType.isNumber(this._target_value)) {
					if (CoreType.isNumber(target_property)) {
						for (let property_name of property_names) {
							vars[property_name] = this.withOp(target_property, this._target_value, operation);
						}
					}
				} else {
					if (!CoreType.isNumber(target_property)) {
						for (let property_name of property_names) {
							vars[property_name] = this.withOp(
								target_property[property_name as 'x'],
								this._target_value[property_name as 'x'],
								operation
							);
						}
					}
				}

				if (to_target) {
					this._startTimeline(timeline_builder, timeline, vars, to_target);
				}
			}
		}
	}
	private _sceneGraphProps(object: object, property_name: string): Object3DProps | undefined {
		const elements = property_name.split(PROPERTY_SEPARATOR);
		if (elements.length > 1) {
			const first_element = elements.shift() as string;
			const sub_object = (object as any)[first_element as any] as object;
			if (sub_object) {
				const sub_property_name = elements.join(PROPERTY_SEPARATOR);
				return this._sceneGraphProps(sub_object, sub_property_name);
			}
		} else {
			const target_property = (object as any)[property_name as any] as AnimPropertyTargetValue;
			let to_target: object | null = null;
			const property_names: string[] = [];
			if (CoreType.isNumber(target_property)) {
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
				if (this._target_value instanceof Quaternion) {
					// is_quaternion = true;
				}
			}
			return {
				target_property: target_property,
				to_target: to_target,
				property_names: property_names,
			};
		}
	}

	private _populateWithNode(node: BaseNodeType, timeline_builder: TimelineBuilder, timeline: gsap.core.Timeline) {
		this._printDebug(['_populateWithNode', node]);
		const target_param = node.p[this._property_name as any] as BaseParamType;
		this._printDebug(['target_param', target_param]);
		if (!target_param) {
			Poly.warn(`${this._property_name} not found on node ${node.path()}`);
			return;
		}

		if (target_param) {
			this._populateVarsForParam(target_param, timeline_builder, timeline);
		}
	}

	private _populateVarsForParam(
		param: BaseParamType,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		this._printDebug(['_populateVarsForParam', param]);
		switch (param.type()) {
			case ParamType.INTEGER: {
				return this._populateVarsForParamInteger(param as FloatParam, timeline_builder, timeline);
			}
			case ParamType.FLOAT: {
				return this._populateVarsForParamFloat(param as FloatParam, timeline_builder, timeline);
			}
			case ParamType.VECTOR2: {
				return this._populateVarsForParamVector2(param as Vector2Param, timeline_builder, timeline);
			}
			case ParamType.VECTOR3: {
				return this._populateVarsForParamVector3(param as Vector3Param, timeline_builder, timeline);
			}
			case ParamType.VECTOR4: {
				return this._populateVarsForParamVector4(param as Vector4Param, timeline_builder, timeline);
			}
		}
		this._printDebug(`param type cannot be animated (yet): '${param.type()}' '${param.path()}'`);
	}
	private _populateVarsForParamInteger(
		param: FloatParam,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!CoreType.isNumber(this._target_value)) {
			Poly.warn('value is not a numbber', this._target_value);
			return;
		}
		const vars = this._commonVars(timeline_builder);
		const proxy = {num: param.value};
		vars.onUpdate = () => {
			param.set(proxy.num);
		};
		const operation = timeline_builder.operation();
		vars.num = this.withOp(param.value, this._target_value, operation);
		this._startTimeline(timeline_builder, timeline, vars, proxy);
	}
	private _populateVarsForParamFloat(
		param: FloatParam,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!CoreType.isNumber(this._target_value)) {
			Poly.warn('value is not a numbber', this._target_value);
			return;
		}
		const vars = this._commonVars(timeline_builder);
		const proxy = {num: param.value};
		vars.onUpdate = () => {
			param.set(proxy.num);
		};
		const operation = timeline_builder.operation();
		vars.num = this.withOp(param.value, this._target_value, operation);
		this._startTimeline(timeline_builder, timeline, vars, proxy);
	}
	private _populateVarsForParamVector2(
		param: Vector2Param,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._target_value instanceof Vector2)) {
			return;
		}
		const vars = this._commonVars(timeline_builder);
		const proxy = param.value.clone();
		const proxy_array: Number2 = [0, 0];
		vars.onUpdate = () => {
			proxy.toArray(proxy_array);
			param.set(proxy_array);
		};
		const operation = timeline_builder.operation();
		vars.x = this.withOp(param.value.x, this._target_value.x, operation);
		vars.y = this.withOp(param.value.y, this._target_value.y, operation);
		this._startTimeline(timeline_builder, timeline, vars, proxy);
	}
	private _populateVarsForParamVector3(
		param: Vector3Param,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._target_value instanceof Vector3)) {
			return;
		}
		const vars = this._commonVars(timeline_builder);
		const proxy = param.value.clone();
		const proxy_array: Number3 = [0, 0, 0];
		vars.onUpdate = () => {
			proxy.toArray(proxy_array);
			param.set(proxy_array);
		};
		const operation = timeline_builder.operation();
		vars.x = this.withOp(param.value.x, this._target_value.x, operation);
		vars.y = this.withOp(param.value.y, this._target_value.y, operation);
		vars.z = this.withOp(param.value.z, this._target_value.z, operation);
		this._startTimeline(timeline_builder, timeline, vars, proxy);
	}

	private _populateVarsForParamVector4(
		param: Vector4Param,
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._target_value instanceof Vector4)) {
			return;
		}
		const vars = this._commonVars(timeline_builder);
		const proxy = param.value.clone();
		const proxy_array: Number4 = [0, 0, 0, 0];
		vars.onUpdate = () => {
			proxy.toArray(proxy_array);
			param.set(proxy_array);
		};
		const operation = timeline_builder.operation();
		vars.x = this.withOp(param.value.x, this._target_value.x, operation);
		vars.y = this.withOp(param.value.y, this._target_value.y, operation);
		vars.z = this.withOp(param.value.z, this._target_value.z, operation);
		vars.w = this.withOp(param.value.w, this._target_value.w, operation);
		this._startTimeline(timeline_builder, timeline, vars, proxy);
	}

	private withOp(current_value: number, value: number, operation: Operation) {
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
	private _commonVars(timeline_builder: TimelineBuilder) {
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
		const repeat_params = timeline_builder.repeatParams();
		if (repeat_params) {
			vars.repeat = repeat_params.count;
			vars.repeatDelay = repeat_params.delay;
			vars.yoyo = repeat_params.yoyo;
		}

		return vars;
	}
	private _startTimeline(
		timeline_builder: TimelineBuilder,
		timeline: gsap.core.Timeline,
		vars: gsap.TweenVars,
		target: object
	) {
		const position = timeline_builder.position();
		const position_param = position ? position.toParameter() : undefined;
		timeline.to(target, vars, position_param);
	}
}

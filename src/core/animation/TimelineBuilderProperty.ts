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
import {ColorParam} from '../../engine/params/Color';
import {IntegerParam} from '../../engine/params/Integer';

export type AnimPropertyTargetValue = number | Vector2 | Vector3 | Vector4 | Quaternion;

interface Object3DProps {
	targetProperty: AnimPropertyTargetValue;
	toTarget: object;
	propertyNames: string[];
}

const PROPERTY_SEPARATOR = '.';

export class TimelineBuilderProperty {
	private _propertyName: string | undefined;
	private _targetValue: AnimPropertyTargetValue | undefined;
	constructor() {}
	setName(name: string) {
		this._propertyName = name;
	}
	setTargetValue(value: AnimPropertyTargetValue) {
		this._targetValue = value;
	}
	name() {
		return this._propertyName;
	}
	targetValue() {
		return this._targetValue;
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
		if (this._propertyName) {
			cloned.setName(this._propertyName);
		}
		if (this._targetValue != null) {
			const newTargetValue = CoreType.isNumber(this._targetValue) ? this._targetValue : this._targetValue.clone();
			cloned.setTargetValue(newTargetValue);
		}

		return cloned;
	}

	addToTimeline(timelineBuilder: TimelineBuilder, timeline: gsap.core.Timeline, target: PropertyTarget) {
		const objects = target.objects();
		if (objects) {
			this._populateWithObjects(objects, timelineBuilder, timeline);
		}
		const node = target.node();
		if (node) {
			this._populateWithNode(node, timelineBuilder, timeline);
		}
	}
	private _populateWithObjects(objects: Object3D[], timelineBuilder: TimelineBuilder, timeline: gsap.core.Timeline) {
		this._printDebug(['_populateWithObjects', objects]);
		if (!this._propertyName) {
			Poly.warn('no property name given');
			return;
		}
		if (this._targetValue == null) {
			Poly.warn('no target value given');
			return;
		}
		const operation = timelineBuilder.operation();
		const updateCallback = timelineBuilder.updateCallback();

		for (let object3d of objects) {
			// const target_property = (object3d as any)[this._property_name as any] as TargetValue;
			// let to_target: object | null = null;
			const props = this._sceneGraphProps(object3d, this._propertyName);
			if (props) {
				let {targetProperty, toTarget, propertyNames} = props;
				const vars = this._commonVars(timelineBuilder);

				// add update_matrix
				if (updateCallback && updateCallback.updateMatrix()) {
					const oldMatrixAutoUpdate = object3d.matrixAutoUpdate;
					vars.onStart = () => {
						object3d.matrixAutoUpdate = true;
					};
					vars.onComplete = () => {
						object3d.matrixAutoUpdate = oldMatrixAutoUpdate;
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
				if (targetProperty instanceof Quaternion && this._targetValue instanceof Quaternion) {
					const proxy = {value: 0};
					const qTarget = targetProperty;
					const qStart = new Quaternion().copy(targetProperty);
					const qEnd = this._targetValue;
					vars.onUpdate = () => {
						qTarget.slerpQuaternions(qStart, qEnd, proxy.value);
					};
					toTarget = proxy;
					vars.value = 1;
				}

				if (CoreType.isNumber(this._targetValue)) {
					if (CoreType.isNumber(targetProperty)) {
						for (let property_name of propertyNames) {
							vars[property_name] = this.withOp(targetProperty, this._targetValue, operation);
						}
					}
				} else {
					if (!CoreType.isNumber(targetProperty)) {
						for (let propertyName of propertyNames) {
							vars[propertyName] = this.withOp(
								targetProperty[propertyName as 'x'],
								this._targetValue[propertyName as 'x'],
								operation
							);
						}
					}
				}

				if (toTarget) {
					this._startTimeline(timelineBuilder, timeline, vars, toTarget);
				}
			}
		}
	}
	private _sceneGraphProps(object: object, property_name: string): Object3DProps | undefined {
		const elements = property_name.split(PROPERTY_SEPARATOR);
		if (elements.length > 1) {
			const firstElement = elements.shift() as string;
			const subObject = (object as any)[firstElement as any] as object;
			if (subObject) {
				const subPropertyName = elements.join(PROPERTY_SEPARATOR);
				return this._sceneGraphProps(subObject, subPropertyName);
			}
		} else {
			const targetProperty = (object as any)[property_name as any] as AnimPropertyTargetValue;
			let toTarget: object | null = null;
			const propertyNames: string[] = [];
			if (CoreType.isNumber(targetProperty)) {
				toTarget = object;
				propertyNames.push(property_name);
			} else {
				toTarget = targetProperty;
				if (this._targetValue instanceof Vector2) {
					propertyNames.push('x', 'y');
				}
				if (this._targetValue instanceof Vector3) {
					propertyNames.push('x', 'y', 'z');
				}
				if (this._targetValue instanceof Vector4) {
					propertyNames.push('x', 'y', 'z', 'w');
				}
				if (this._targetValue instanceof Quaternion) {
					// is_quaternion = true;
				}
			}
			return {
				targetProperty: targetProperty,
				toTarget: toTarget,
				propertyNames: propertyNames,
			};
		}
	}

	private _populateWithNode(node: BaseNodeType, timelineBuilder: TimelineBuilder, timeline: gsap.core.Timeline) {
		this._printDebug(['_populateWithNode', node]);
		const targetParam = node.p[this._propertyName as any] as BaseParamType;
		this._printDebug(['targetParam', targetParam]);
		if (!targetParam) {
			Poly.warn(`${this._propertyName} not found on node ${node.path()}`);
			return;
		}

		if (targetParam) {
			this._populateVarsForParam(targetParam, timelineBuilder, timeline);
		}
	}

	private _populateVarsForParam(
		param: BaseParamType,
		timelineBuilder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		this._printDebug(['_populateVarsForParam', param]);
		switch (param.type()) {
			case ParamType.INTEGER: {
				return this._populateVarsForParamInteger(param as IntegerParam, timelineBuilder, timeline);
			}
			case ParamType.FLOAT: {
				return this._populateVarsForParamFloat(param as FloatParam, timelineBuilder, timeline);
			}
			case ParamType.VECTOR2: {
				return this._populateVarsForParamVector2(param as Vector2Param, timelineBuilder, timeline);
			}
			case ParamType.VECTOR3: {
				return this._populateVarsForParamVector3(param as Vector3Param, timelineBuilder, timeline);
			}
			case ParamType.COLOR: {
				return this._populateVarsForParamColor(param as ColorParam, timelineBuilder, timeline);
			}
			case ParamType.VECTOR4: {
				return this._populateVarsForParamVector4(param as Vector4Param, timelineBuilder, timeline);
			}
		}
		Poly.warn(`param type cannot be animated (yet): '${param.type()}' '${param.path()}'`);
	}
	private _populateVarsForParamInteger(
		param: IntegerParam,
		timelineBuilder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!CoreType.isNumber(this._targetValue)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate integer param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const vars = this._commonVars(timelineBuilder);
		const proxy = {num: param.value};
		vars.onUpdate = () => {
			param.set(proxy.num);
		};
		const operation = timelineBuilder.operation();
		vars.num = this.withOp(param.value, this._targetValue, operation);
		this._startTimeline(timelineBuilder, timeline, vars, proxy);
	}
	private _populateVarsForParamFloat(
		param: FloatParam,
		timelineBuilder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!CoreType.isNumber(this._targetValue)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate float param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const vars = this._commonVars(timelineBuilder);
		const proxy = {num: param.value};
		vars.onUpdate = () => {
			param.set(proxy.num);
		};
		const operation = timelineBuilder.operation();
		vars.num = this.withOp(param.value, this._targetValue, operation);
		this._startTimeline(timelineBuilder, timeline, vars, proxy);
	}
	private _populateVarsForParamVector2(
		param: Vector2Param,
		timelineBuilder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._targetValue instanceof Vector2)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate vector2 param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const vars = this._commonVars(timelineBuilder);
		const proxy = param.value.clone();
		const proxyArray: Number2 = [0, 0];
		vars.onUpdate = () => {
			proxy.toArray(proxyArray);
			param.set(proxyArray);
		};
		const operation = timelineBuilder.operation();
		vars.x = this.withOp(param.value.x, this._targetValue.x, operation);
		vars.y = this.withOp(param.value.y, this._targetValue.y, operation);
		this._startTimeline(timelineBuilder, timeline, vars, proxy);
	}
	private _populateVarsForParamVector3(
		param: Vector3Param,
		timelineBuilder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._targetValue instanceof Vector3)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate vector3 param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const vars = this._commonVars(timelineBuilder);
		const proxy = param.value.clone();
		const proxyArray: Number3 = [0, 0, 0];
		vars.onUpdate = () => {
			proxy.toArray(proxyArray);
			param.set(proxyArray);
		};
		const operation = timelineBuilder.operation();
		vars.x = this.withOp(param.value.x, this._targetValue.x, operation);
		vars.y = this.withOp(param.value.y, this._targetValue.y, operation);
		vars.z = this.withOp(param.value.z, this._targetValue.z, operation);
		this._startTimeline(timelineBuilder, timeline, vars, proxy);
	}

	private _populateVarsForParamVector4(
		param: Vector4Param,
		timelineBuilder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._targetValue instanceof Vector4)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate vector4 param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const vars = this._commonVars(timelineBuilder);
		const proxy = param.value.clone();
		const proxyArray: Number4 = [0, 0, 0, 0];
		vars.onUpdate = () => {
			proxy.toArray(proxyArray);
			param.set(proxyArray);
		};
		const operation = timelineBuilder.operation();
		vars.x = this.withOp(param.value.x, this._targetValue.x, operation);
		vars.y = this.withOp(param.value.y, this._targetValue.y, operation);
		vars.z = this.withOp(param.value.z, this._targetValue.z, operation);
		vars.w = this.withOp(param.value.w, this._targetValue.w, operation);
		this._startTimeline(timelineBuilder, timeline, vars, proxy);
	}
	private _populateVarsForParamColor(
		param: ColorParam,
		timelineBuilder: TimelineBuilder,
		timeline: gsap.core.Timeline
	) {
		if (!(this._targetValue instanceof Vector3)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate color param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const vars = this._commonVars(timelineBuilder);
		const valuePreConversion = param.valuePreConversion();
		const proxy = new Vector3(valuePreConversion.r, valuePreConversion.g, valuePreConversion.b);
		const proxyArray: Number3 = [0, 0, 0];
		vars.onUpdate = () => {
			proxy.toArray(proxyArray);
			param.set(proxyArray);
		};
		const operation = timelineBuilder.operation();
		vars.x = this.withOp(param.value.r, this._targetValue.x, operation);
		vars.y = this.withOp(param.value.g, this._targetValue.y, operation);
		vars.z = this.withOp(param.value.b, this._targetValue.z, operation);
		this._startTimeline(timelineBuilder, timeline, vars, proxy);
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
	private _commonVars(timelineBuilder: TimelineBuilder) {
		const duration = timelineBuilder.duration();
		const vars: gsap.TweenVars = {duration: duration};

		// easing
		const easing = timelineBuilder.easing() || AnimNodeEasing.NONE;
		if (easing) {
			vars.ease = easing;
		}

		// delay
		const delay = timelineBuilder.delay();
		if (delay != null) {
			vars.delay = delay;
		}

		// repeat
		const repeatParams = timelineBuilder.repeatParams();
		if (repeatParams) {
			vars.repeat = repeatParams.count;
			vars.repeatDelay = repeatParams.delay;
			vars.yoyo = repeatParams.yoyo;
		}

		return vars;
	}
	private _startTimeline(
		timelineBuilder: TimelineBuilder,
		timeline: gsap.core.Timeline,
		vars: gsap.TweenVars,
		target: object
	) {
		const position = timelineBuilder.position();
		const positionParam = position ? position.toParameter() : undefined;
		timeline.to(target, vars, positionParam);
	}
}

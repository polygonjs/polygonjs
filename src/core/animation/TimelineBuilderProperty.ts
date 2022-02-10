import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {Color} from 'three/src/math/Color';
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
import {AnimatedPropertiesRegister, RegisterableProperty} from './AnimatedPropertiesRegister';
import {NodeParamProxiesRegister} from './NodeParamProxiesRegister';
import {
	ColorParamProxy,
	FloatParamProxy,
	IntegerParamProxy,
	Vector2ParamProxy,
	Vector3ParamProxy,
	Vector4ParamProxy,
} from './ParamProxy';

export type AnimPropertyTargetValue = number | Vector2 | Vector3 | Color | Vector4 | Quaternion;

interface Object3DProps {
	targetProperty: AnimPropertyTargetValue;
	toTarget: object;
	propertyNames: string[];
}
export interface RegisterOptions {
	registerproperties?: boolean;
}
interface StartOptions extends RegisterOptions {
	timelineBuilder: TimelineBuilder;
	timeline: gsap.core.Timeline;
	vars: gsap.TweenVars;
	target: object;
	registerableProp: RegisterableProperty;
}
interface AddToTimelineOptions extends RegisterOptions {
	timelineBuilder: TimelineBuilder;
	timeline: gsap.core.Timeline;
	target: PropertyTarget;
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

	addToTimeline(options: AddToTimelineOptions) {
		const {target} = options;
		const objects = target.objects();
		const node = target.node();
		this._printDebug(['addToTimeline', target, objects, node]);
		if (objects) {
			this._populateWithObjects(objects, options);
		}
		if (node) {
			this._populateWithNode(node, options);
		}
	}
	private _populateWithObjects(objects: Object3D[], options: AddToTimelineOptions) {
		const {timelineBuilder} = options;
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
				const registerableProp: RegisterableProperty = {
					object: object3d,
					propertyName: this._propertyName,
				};
				let {targetProperty, toTarget, propertyNames} = props;
				const vars = this._commonVars(timelineBuilder);

				// add update_matrix
				if (updateCallback && updateCallback.updateMatrix()) {
					const oldMatrixAutoUpdate = object3d.matrixAutoUpdate;
					// matrixAutoUpdate should be set to true during onUpdate and not onStart
					// in case another timeline completes and sets it to false
					vars.onUpdate = () => {
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
					if (CoreType.isVector(targetProperty) && CoreType.isVector(this._targetValue)) {
						for (let propertyName of propertyNames) {
							vars[propertyName] = this.withOp(
								targetProperty[propertyName as 'x'],
								this._targetValue[propertyName as 'x'],
								operation
							);
						}
					} else {
						if (CoreType.isColor(targetProperty) && CoreType.isColor(this._targetValue)) {
							for (let propertyName of propertyNames) {
								vars[propertyName] = this.withOp(
									targetProperty[propertyName as 'r'],
									this._targetValue[propertyName as 'r'],
									operation
								);
							}
						}
					}
				}

				if (toTarget) {
					this._startTimeline({...options, vars, target: toTarget, registerableProp});
				}
			}
		}
	}
	private _sceneGraphProps(object: object, propertyName: string): Object3DProps | undefined {
		const elements = propertyName.split(PROPERTY_SEPARATOR);
		if (elements.length > 1) {
			const firstElement = elements.shift() as string;
			const subObject = (object as any)[firstElement as any] as object;
			if (subObject) {
				const subPropertyName = elements.join(PROPERTY_SEPARATOR);
				return this._sceneGraphProps(subObject, subPropertyName);
			} else {
				console.warn(`property ${firstElement} not found on object`, object);
			}
		} else {
			const targetProperty = (object as any)[propertyName as any] as AnimPropertyTargetValue;
			let toTarget: object | null = null;
			const propertyNames: string[] = [];
			if (CoreType.isNumber(targetProperty)) {
				toTarget = object;
				propertyNames.push(propertyName);
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
				if (this._targetValue instanceof Color) {
					propertyNames.push('r', 'g', 'b');
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

	private _populateWithNode(node: BaseNodeType, options: AddToTimelineOptions) {
		this._printDebug(['_populateWithNode', node]);
		const targetParam = node.p[this._propertyName as any] as BaseParamType;
		this._printDebug(['targetParam', targetParam]);
		if (!targetParam) {
			Poly.warn(`${this._propertyName} not found on node ${node.path()}`);
			return;
		}

		if (targetParam) {
			this._populateVarsForParam(targetParam, options);
		}
	}

	private _populateVarsForParam(param: BaseParamType, options: AddToTimelineOptions) {
		this._printDebug(['_populateVarsForParam', param]);
		switch (param.type()) {
			case ParamType.INTEGER: {
				return this._populateVarsForParamInteger(param as IntegerParam, options);
			}
			case ParamType.FLOAT: {
				return this._populateVarsForParamFloat(param as FloatParam, options);
			}
			case ParamType.VECTOR2: {
				return this._populateVarsForParamVector2(param as Vector2Param, options);
			}
			case ParamType.VECTOR3: {
				return this._populateVarsForParamVector3(param as Vector3Param, options);
			}
			case ParamType.COLOR: {
				return this._populateVarsForParamColor(param as ColorParam, options);
			}
			case ParamType.VECTOR4: {
				return this._populateVarsForParamVector4(param as Vector4Param, options);
			}
		}
		Poly.warn(`param type cannot be animated (yet): '${param.type()}' '${param.path()}'`);
	}
	private _populateVarsForSingleNumericParam(param: IntegerParam | FloatParam, options: AddToTimelineOptions) {
		if (!CoreType.isNumber(this._targetValue)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate float/integer param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const proxy = NodeParamProxiesRegister.paramProxy(param) as FloatParamProxy | IntegerParamProxy;
		if (!proxy) {
			return;
		}
		const keyframes = options.timelineBuilder.keyframes();
		const interpolant = keyframes ? keyframes.createInterpolant() : undefined;
		const vars = this._commonVars(options.timelineBuilder);
		vars.onUpdate = () => {
			proxy.update(interpolant);
		};
		let targetValue = this._targetValue;
		if (keyframes) {
			// TODO: keyframes should change duration
			// vars.duration = 1
			targetValue = 1;
		}

		const operation = options.timelineBuilder.operation();
		vars.proxyValue = this.withOp(param.value, targetValue, operation);
		this._startTimeline({...options, vars, target: proxy, registerableProp: param});
	}
	private _populateVarsForParamInteger(param: IntegerParam, options: AddToTimelineOptions) {
		this._populateVarsForSingleNumericParam(param, options);
	}
	private _populateVarsForParamFloat(param: FloatParam, options: AddToTimelineOptions) {
		this._populateVarsForSingleNumericParam(param, options);
	}
	private _populateVarsForParamVector2(param: Vector2Param, options: AddToTimelineOptions) {
		if (!(this._targetValue instanceof Vector2)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate vector2 param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const proxy = NodeParamProxiesRegister.paramProxy(param) as Vector2ParamProxy;
		if (!proxy) {
			return;
		}
		const vars = this._commonVars(options.timelineBuilder);
		vars.onUpdate = () => {
			proxy.update();
		};
		const operation = options.timelineBuilder.operation();
		vars.x = this.withOp(param.value.x, this._targetValue.x, operation);
		vars.y = this.withOp(param.value.y, this._targetValue.y, operation);
		this._startTimeline({...options, vars, target: proxy.proxyValue, registerableProp: param});
	}
	private _populateVarsForParamVector3(param: Vector3Param, options: AddToTimelineOptions) {
		if (!(this._targetValue instanceof Vector3)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate vector3 param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const proxy = NodeParamProxiesRegister.paramProxy(param) as Vector3ParamProxy;
		if (!proxy) {
			return;
		}
		const vars = this._commonVars(options.timelineBuilder);
		vars.onUpdate = () => {
			proxy.update();
		};
		const operation = options.timelineBuilder.operation();
		vars.x = this.withOp(param.value.x, this._targetValue.x, operation);
		vars.y = this.withOp(param.value.y, this._targetValue.y, operation);
		vars.z = this.withOp(param.value.z, this._targetValue.z, operation);
		this._startTimeline({...options, vars, target: proxy.proxyValue, registerableProp: param});
	}

	private _populateVarsForParamVector4(param: Vector4Param, options: AddToTimelineOptions) {
		if (!(this._targetValue instanceof Vector4)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate vector4 param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const proxy = NodeParamProxiesRegister.paramProxy(param) as Vector4ParamProxy;
		if (!proxy) {
			return;
		}
		const vars = this._commonVars(options.timelineBuilder);
		vars.onUpdate = () => {
			proxy.update();
		};
		const operation = options.timelineBuilder.operation();
		vars.x = this.withOp(param.value.x, this._targetValue.x, operation);
		vars.y = this.withOp(param.value.y, this._targetValue.y, operation);
		vars.z = this.withOp(param.value.z, this._targetValue.z, operation);
		vars.w = this.withOp(param.value.w, this._targetValue.w, operation);
		this._startTimeline({...options, vars, target: proxy.proxyValue, registerableProp: param});
	}
	private _populateVarsForParamColor(param: ColorParam, options: AddToTimelineOptions) {
		if (!(this._targetValue instanceof Color || this._targetValue instanceof Vector3)) {
			Poly.warn(
				`TimelineBuilderProperty error: cannot animate color param '${param.path()}' with targetValue`,
				this._targetValue
			);
			return;
		}
		const proxy = NodeParamProxiesRegister.paramProxy(param) as ColorParamProxy;
		if (!proxy) {
			return;
		}
		const vars = this._commonVars(options.timelineBuilder);
		vars.onUpdate = () => {
			proxy.update();
		};
		const operation = options.timelineBuilder.operation();
		const x = this._targetValue instanceof Color ? this._targetValue.r : this._targetValue.x;
		const y = this._targetValue instanceof Color ? this._targetValue.g : this._targetValue.y;
		const z = this._targetValue instanceof Color ? this._targetValue.b : this._targetValue.z;
		vars.r = this.withOp(param.value.r, x, operation);
		vars.g = this.withOp(param.value.g, y, operation);
		vars.b = this.withOp(param.value.b, z, operation);
		this._startTimeline({...options, vars, target: proxy.proxyValue, registerableProp: param});
	}

	private withOp(currentValue: number, value: number, operation: Operation) {
		switch (operation) {
			case Operation.SET:
				return value;
			case Operation.ADD:
				return currentValue + value;
			case Operation.SUBTRACT:
				return currentValue - value;
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
	private _startTimeline(options: StartOptions) {
		const {timelineBuilder, timeline, vars, target, registerableProp, registerproperties} = options;

		const position = timelineBuilder.position();
		const positionParam = position ? position.toParameter() : undefined;
		const existingTimeline = AnimatedPropertiesRegister.registeredTimelineForProperty(registerableProp);
		const newTimeline = timeline.to(target, vars, positionParam);

		const onStart = () => {
			if (existingTimeline) {
				if (existingTimeline.stoppable) {
					existingTimeline.timeline.kill();
					AnimatedPropertiesRegister.deRegisterProp(registerableProp);
				} else {
					newTimeline.kill();
					return;
				}
			}
			if (registerproperties) {
				AnimatedPropertiesRegister.registerProp(registerableProp, {
					timeline: newTimeline,
					stoppable: timelineBuilder.stoppable(),
				});
			}
		};
		const onComplete = () => {
			AnimatedPropertiesRegister.deRegisterProp(registerableProp);
		};

		if (vars.onStart) {
			const prevOnStart = vars.onStart;
			vars.onStart = () => {
				onStart();
				prevOnStart();
			};
		} else {
			vars.onStart = onStart;
		}

		if (vars.onComplete) {
			const prevOnComplete = vars.onComplete;
			vars.onComplete = () => {
				onComplete();
				prevOnComplete();
			};
		} else {
			vars.onComplete = onComplete;
		}
	}
}

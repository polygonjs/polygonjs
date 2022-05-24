import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {Color} from 'three';
import {Quaternion} from 'three';
import {Object3D} from 'three';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {BaseParamType} from '../../engine/params/_Base';
import {ParamType} from '../../engine/poly/ParamType';
import {Vector2Param} from '../../engine/params/Vector2';
import {Vector3Param} from '../../engine/params/Vector3';
import {Vector4Param} from '../../engine/params/Vector4';
import {Poly} from '../../engine/Poly';
import {CoreType} from '../Type';
import {ColorParam} from '../../engine/params/Color';
import {IntegerParam} from '../../engine/params/Integer';
import {RegisterableProperty} from './AnimatedPropertiesRegister';
import {animBuilderCommonVars} from './vars/Common';
import {AddToTimelineOptions, Operation} from './vars/AnimBuilderTypes';
import {animBuilderStartTimeline} from './vars/StartTimeline';
import {populateVarsForParamVector4} from './vars/type/Vector4';
import {populateVarsForColor, populateVarsForParamColor} from './vars/type/Color';
import {populateVarsForParamVector3} from './vars/type/Vector3';
import {populateVarsForParamVector2} from './vars/type/Vector2';
import {populateVarsForNumber, populateVarsForSingleNumber} from './vars/type/Number';
import {populateVarsForVector} from './vars/type/Vector';
import {populateVarsAndCreateProxyForQuaternion} from './vars/type/Quaternion';
import {populateVarsForEuler} from './vars/type/Euler';

export type AnimPropertyTargetValue = number | Vector2 | Vector3 | Color | Vector4 | Quaternion;

interface Object3DProps {
	targetProperty: AnimPropertyTargetValue;
	toTarget: object;
	propertyNames: string[];
}
interface PopulateVarsOptions {
	vars: gsap.TweenVars;
	targetValue: AnimPropertyTargetValue;
	targetProperty: AnimPropertyTargetValue;
	propertyNames: string[];
	operation: Operation;
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
		const target = options.propertyTarget || options.target;
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
				const vars = animBuilderCommonVars(timelineBuilder);

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
					toTarget = populateVarsAndCreateProxyForQuaternion({
						targetValue: this._targetValue,
						vars,
						targetProperty,
					});
				}

				this._populateVarsForObjectProperty({
					targetValue: this._targetValue,
					vars,
					targetProperty,
					propertyNames,
					operation,
				});

				if (toTarget) {
					animBuilderStartTimeline({...options, vars, target: toTarget, registerableProp});
				}
			}
		}
	}
	private _populateVarsForObjectProperty(options: PopulateVarsOptions) {
		const {vars, targetValue, targetProperty, propertyNames, operation} = options;
		function warnMismatch(expectedType: string) {
			Poly.warn(
				`mismatch between targetValue and targetProperty (expected ${expectedType})`,
				targetValue,
				targetProperty
			);
		}
		// number
		if (CoreType.isNumber(targetProperty)) {
			if (CoreType.isNumber(targetValue)) {
				return populateVarsForNumber({targetValue, vars, targetProperty, propertyNames, operation});
			}
			return warnMismatch('number');
		}
		// euler (needs to be positioned before the CoreType.isVector, as it would other be caught in the isVector )
		// note that for euler, we first test targetProperty, as otherwise a 'position' property would test true here
		if (CoreType.isEuler(targetProperty)) {
			if (targetValue instanceof Vector3) {
				return populateVarsForEuler({targetValue, vars, targetProperty, propertyNames, operation});
			}
			return warnMismatch('euler');
		}
		// vector
		if (CoreType.isVector(targetProperty)) {
			if (CoreType.isVector(targetValue)) {
				return populateVarsForVector({targetValue, vars, targetProperty, propertyNames, operation});
			}
			return warnMismatch('vector');
		}
		// color
		if (CoreType.isColor(targetProperty)) {
			if (CoreType.isColor(targetValue)) {
				return populateVarsForColor({targetValue, vars, targetProperty, propertyNames, operation});
			}
			return warnMismatch('color');
		}

		if (CoreType.isQuaternion(targetProperty)) {
			//
		}
		Poly.warn(`targetValue and targetProp are not recognized types`, targetValue, targetProperty);
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
				Poly.warn(`property ${firstElement} not found on object`, object);
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
		if (!this._targetValue) {
			return;
		}
		switch (param.type()) {
			case ParamType.INTEGER:
			case ParamType.FLOAT: {
				return populateVarsForSingleNumber(param as IntegerParam, this._targetValue, options);
			}
			case ParamType.VECTOR2: {
				return populateVarsForParamVector2(param as Vector2Param, this._targetValue, options);
			}
			case ParamType.VECTOR3: {
				return populateVarsForParamVector3(param as Vector3Param, this._targetValue, options);
			}
			case ParamType.COLOR: {
				return populateVarsForParamColor(param as ColorParam, this._targetValue, options);
			}
			case ParamType.VECTOR4: {
				return populateVarsForParamVector4(param as Vector4Param, this._targetValue, options);
			}
		}
		Poly.warn(`param type cannot be animated (yet): '${param.type()}' '${param.path()}'`);
	}
}

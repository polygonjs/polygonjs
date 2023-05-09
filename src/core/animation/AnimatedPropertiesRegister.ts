import {Object3D} from 'three';
import {ColorParam} from '../../engine/params/Color';
import {FloatParam} from '../../engine/params/Float';
import {IntegerParam} from '../../engine/params/Integer';
import {Vector2Param} from '../../engine/params/Vector2';
import {Vector3Param} from '../../engine/params/Vector3';
import {Vector4Param} from '../../engine/params/Vector4';
import {TimelineData} from '../thirdParty/gsap';

interface SceneGraphProperty {
	object: Object3D;
	propertyName: string;
}
export type RegisterableProperty =
	| SceneGraphProperty
	| string
	| IntegerParam
	| FloatParam
	| Vector2Param
	| Vector3Param
	| Vector4Param
	| ColorParam;

class AnimatedPropertiesRegisterClass {
	private static _instance: AnimatedPropertiesRegisterClass;
	static instance() {
		return (this._instance = this._instance || new AnimatedPropertiesRegisterClass());
	}
	private _propertiesMap: Map<RegisterableProperty, TimelineData> = new Map();
	private constructor() {}

	registerProp(property: RegisterableProperty, timelineData: TimelineData) {
		this._propertiesMap.set(this._convert(property), timelineData);
	}
	deRegisterProp(property: RegisterableProperty) {
		this._propertiesMap.delete(this._convert(property));
	}
	registeredTimelineForProperty(property: RegisterableProperty) {
		return this._propertiesMap.get(this._convert(property));
	}
	registeredPropertiesCount() {
		let count = 0;
		this._propertiesMap.forEach(() => {
			count++;
		});
		return count;
	}

	private _convert(property: RegisterableProperty) {
		if ((property as SceneGraphProperty).object) {
			const sceneGraphProp = property as SceneGraphProperty;
			return `${sceneGraphProp.object.uuid}:${sceneGraphProp.propertyName}`;
		} else {
			return property;
		}
	}
}
export const AnimatedPropertiesRegister = AnimatedPropertiesRegisterClass.instance();

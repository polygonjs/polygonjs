import {Color, Vector2, Vector3, Vector4} from 'three';
import {PolyScene} from '../scene/PolyScene';
import {ParamConstructorMap} from '../params/types/ParamConstructorMap';
import {ParamType} from '../poly/ParamType';
import {touchParamRefFromParam} from '../../core/reactivity/ParamReactivity';
import {NamedFunction1, NamedFunction2, NamedFunction3} from './_Base';
// import {BaseNodeType} from '../nodes/_Base';
import {Number2, Number3, Number4} from '../../types/GlobalTypes';
import {BaseParamType} from '../params/_Base';
import type {BooleanParam} from '../params/Boolean';
import type {ColorParam} from '../params/Color';
import type {FloatParam} from '../params/Float';
import type {IntegerParam} from '../params/Integer';
import type {StringParam} from '../params/String';
import type {Vector2Param} from '../params/Vector2';
import type {Vector3Param} from '../params/Vector3';
import type {Vector4Param} from '../params/Vector4';
import type {ButtonParam} from '../params/Button';

const tmpColor = new Color();
const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();
const tmpN2: Number2 = [0, 0];
const tmpN3: Number3 = [0, 0, 0];
const tmpN4: Number4 = [0, 0, 0, 0];

function _getParam<T extends ParamType>(scene: PolyScene, paramPath: string): ParamConstructorMap[T] | void {
	const elements = paramPath.split('/');
	const paramName = elements.pop() as string;
	const nodePath = elements.join('/');
	const node = scene.node(nodePath);
	if (!node) {
		return;
	}
	const param = node.params.get(paramName);
	if (!param) {
		return;
	}
	return param as ParamConstructorMap[T];
}
export class getParam extends NamedFunction1<[string]> {
	static override type() {
		return 'getParam';
	}
	func(paramPath: string): BaseParamType {
		return _getParam<ParamType.BOOLEAN>(this.scene, paramPath)!;
	}
}

export class setParamBoolean extends NamedFunction2<[BooleanParam, boolean]> {
	static override type() {
		return 'setParamBoolean';
	}
	func(param: BooleanParam, value: boolean): void {
		if (param) {
			param.set(value);
			touchParamRefFromParam(param);
		} else {
			console.warn(`setParamBoolean: no param`);
		}
	}
}
export class setParamBooleanToggle extends NamedFunction1<[BooleanParam]> {
	static override type() {
		return 'setParamBooleanToggle';
	}
	func(param: BooleanParam): void {
		if (param) {
			param.set(!param.value);
			touchParamRefFromParam(param);
		} else {
			console.warn(`setParamBooleanToggle: no param`);
		}
	}
}
export class setParamColor extends NamedFunction3<[ColorParam, Color, number]> {
	static override type() {
		return 'setParamColor';
	}
	func(param: ColorParam, value: Color, lerp: number): void {
		if (param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				tmpColor.copy(param.value);
				tmpColor.lerp(value, lerp);
				tmpColor.toArray(tmpN3);
				param.set(tmpN3);
			}
			touchParamRefFromParam(param);
		} else {
			console.warn(`setParamColor: no param`);
		}
	}
}
export class setParamFloat extends NamedFunction3<[FloatParam, number, number]> {
	static override type() {
		return 'setParamFloat';
	}
	func(param: FloatParam, value: number, lerp: number): void {
		if (param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				param.set(value * lerp + (1 - lerp) * param.value);
			}
			touchParamRefFromParam(param);
		} else {
			console.warn(`setParamFloat: no param`);
		}
	}
}
export class setParamInteger extends NamedFunction3<[IntegerParam, number, number]> {
	static override type() {
		return 'setParamInteger';
	}
	func(param: IntegerParam, value: number, lerp: number): void {
		if (param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				param.set(value * lerp + (1 - lerp) * param.value);
			}
			touchParamRefFromParam(param);
		} else {
			console.warn(`setParamInteger: no param`);
		}
	}
}
export class setParamString extends NamedFunction2<[StringParam, string]> {
	static override type() {
		return 'setParamString';
	}
	func(param: StringParam, value: string): void {
		if (param) {
			param.set(value);
			touchParamRefFromParam(param);
		} else {
			console.warn(`setParamString: no param`);
		}
	}
}
export class setParamVector2 extends NamedFunction3<[Vector2Param, Vector2, number]> {
	static override type() {
		return 'setParamVector2';
	}
	func(param: Vector2Param, value: Vector2, lerp: number): void {
		if (param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				tmpV2.copy(param.value);
				tmpV2.lerp(value, lerp);
				tmpV2.toArray(tmpN2);
				param.set(tmpN2);
			}
			touchParamRefFromParam(param);
		} else {
			console.warn(`setParamVector2: no param`);
		}
	}
}
export class setParamVector3 extends NamedFunction3<[Vector3Param, Vector3, number]> {
	static override type() {
		return 'setParamVector3';
	}
	func(param: Vector3Param, value: Vector3, lerp: number): void {
		if (param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				tmpV3.copy(param.value);
				tmpV3.lerp(value, lerp);
				tmpV3.toArray(tmpN3);
				param.set(tmpN3);
			}
			touchParamRefFromParam(param);
		} else {
			console.warn(`setParamVector3: no param`);
		}
	}
}
export class setParamVector4 extends NamedFunction3<[Vector4Param, Vector4, number]> {
	static override type() {
		return 'setParamVector4';
	}
	func(param: Vector4Param, value: Vector4, lerp: number): void {
		if (param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				tmpV4.copy(param.value);
				tmpV4.lerp(value, lerp);
				tmpV4.toArray(tmpN4);
				param.set(tmpN4);
			}
			touchParamRefFromParam(param);
		} else {
			console.warn(`setParamVector4: no param`);
		}
	}
}
export class pressButtonParam extends NamedFunction1<[ButtonParam]> {
	static override type() {
		return 'pressButtonParam';
	}
	func(param: ButtonParam): void {
		if (param) {
			param.pressButton();
			touchParamRefFromParam(param);
		} else {
			console.warn(`pressButtonParam: no param`);
		}
	}
}

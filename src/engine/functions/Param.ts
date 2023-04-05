import {Color, Vector2, Vector3, Vector4} from 'three';
import {PolyScene} from '../scene/PolyScene';
import {ParamConstructorMap} from '../params/types/ParamConstructorMap';
import {ParamType} from '../poly/ParamType';
import {touchParamRef} from '../../core/reactivity/ParamReactivity';
import {NamedFunction2, NamedFunction3, NamedFunction4} from './_Base';
import {BaseNodeType} from '../nodes/_Base';
import {Number2, Number3, Number4} from '../../types/GlobalTypes';

interface GetParamReturn<T extends ParamType> {
	node: BaseNodeType | undefined;
	param: ParamConstructorMap[T] | undefined;
}
const EMPTY_RETURN: GetParamReturn<ParamType> = {node: undefined, param: undefined};
const tmpColor = new Color();
const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();
const tmpN2: Number2 = [0, 0];
const tmpN3: Number3 = [0, 0, 0];
const tmpN4: Number4 = [0, 0, 0, 0];

function _getParam<T extends ParamType>(scene: PolyScene, nodePath: string, paramName: string): GetParamReturn<T> {
	const node = scene.node(nodePath);
	if (!node) {
		return EMPTY_RETURN as GetParamReturn<T>;
	}
	const param = node.params.get(paramName);
	if (!param) {
		return EMPTY_RETURN as GetParamReturn<T>;
	}
	return {node, param: param as ParamConstructorMap[T]};
}

export class setParamBoolean extends NamedFunction3<[string, string, boolean]> {
	static override type() {
		return 'setParamBoolean';
	}
	func(nodePath: string, paramName: string, value: boolean): void {
		const {node, param} = _getParam<ParamType.BOOLEAN>(this.scene, nodePath, paramName);
		if (node && param) {
			param.set(value);
			touchParamRef(node, paramName);
		}
	}
}
export class setParamBooleanToggle extends NamedFunction2<[string, string]> {
	static override type() {
		return 'setParamBooleanToggle';
	}
	func(nodePath: string, paramName: string): void {
		const {node, param} = _getParam<ParamType.BOOLEAN>(this.scene, nodePath, paramName);
		if (node && param) {
			param.set(!param.value);
			touchParamRef(node, paramName);
		}
	}
}
export class setParamColor extends NamedFunction4<[string, string, Color, number]> {
	static override type() {
		return 'setParamColor';
	}
	func(nodePath: string, paramName: string, value: Color, lerp: number): void {
		const {node, param} = _getParam<ParamType.COLOR>(this.scene, nodePath, paramName);
		if (node && param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				tmpColor.copy(param.value);
				tmpColor.lerp(value, lerp);
				tmpColor.toArray(tmpN3);
				param.set(tmpN3);
			}
			touchParamRef(node, paramName);
		}
	}
}
export class setParamFloat extends NamedFunction4<[string, string, number, number]> {
	static override type() {
		return 'setParamFloat';
	}
	func(nodePath: string, paramName: string, value: number, lerp: number): void {
		const {node, param} = _getParam<ParamType.FLOAT>(this.scene, nodePath, paramName);
		if (node && param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				param.set(value * lerp + (1 - lerp) * param.value);
			}
			touchParamRef(node, paramName);
		}
	}
}
export class setParamInteger extends NamedFunction4<[string, string, number, number]> {
	static override type() {
		return 'setParamInteger';
	}
	func(nodePath: string, paramName: string, value: number, lerp: number): void {
		const {node, param} = _getParam<ParamType.INTEGER>(this.scene, nodePath, paramName);
		if (node && param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				param.set(value * lerp + (1 - lerp) * param.value);
			}
			touchParamRef(node, paramName);
		}
	}
}
export class setParamString extends NamedFunction3<[string, string, string]> {
	static override type() {
		return 'setParamString';
	}
	func(nodePath: string, paramName: string, value: string): void {
		const {node, param} = _getParam<ParamType.STRING>(this.scene, nodePath, paramName);
		if (node && param) {
			param.set(value);
			touchParamRef(node, paramName);
		}
	}
}
export class setParamVector2 extends NamedFunction4<[string, string, Vector2, number]> {
	static override type() {
		return 'setParamVector2';
	}
	func(nodePath: string, paramName: string, value: Vector2, lerp: number): void {
		const {node, param} = _getParam<ParamType.VECTOR2>(this.scene, nodePath, paramName);
		if (node && param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				tmpV2.copy(param.value);
				tmpV2.lerp(value, lerp);
				tmpV2.toArray(tmpN2);
				param.set(tmpN2);
			}
			touchParamRef(node, paramName);
		}
	}
}
export class setParamVector3 extends NamedFunction4<[string, string, Vector3, number]> {
	static override type() {
		return 'setParamVector3';
	}
	func(nodePath: string, paramName: string, value: Vector3, lerp: number): void {
		const {node, param} = _getParam<ParamType.VECTOR3>(this.scene, nodePath, paramName);
		if (node && param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				tmpV3.copy(param.value);
				tmpV3.lerp(value, lerp);
				tmpV3.toArray(tmpN3);
				param.set(tmpN3);
			}
			touchParamRef(node, paramName);
		}
	}
}
export class setParamVector4 extends NamedFunction4<[string, string, Vector4, number]> {
	static override type() {
		return 'setParamVector4';
	}
	func(nodePath: string, paramName: string, value: Vector4, lerp: number): void {
		const {node, param} = _getParam<ParamType.VECTOR4>(this.scene, nodePath, paramName);
		if (node && param) {
			if (lerp >= 1) {
				param.set(value);
			} else {
				tmpV4.copy(param.value);
				tmpV4.lerp(value, lerp);
				tmpV4.toArray(tmpN4);
				param.set(tmpN4);
			}
			touchParamRef(node, paramName);
		}
	}
}
export class pressButtonParam extends NamedFunction2<[string, string]> {
	static override type() {
		return 'pressButtonParam';
	}
	func(nodePath: string, paramName: string): void {
		const {node, param} = _getParam<ParamType.BUTTON>(this.scene, nodePath, paramName);
		if (node && param) {
			param.pressButton();
			touchParamRef(node, paramName);
		}
	}
}

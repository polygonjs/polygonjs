import {BaseNodeType} from '../../engine/nodes/_Base';
import {FloatParam} from '../../engine/params/Float';
import {Vector3Param} from '../../engine/params/Vector3';
import {BaseParamType} from '../../engine/params/_Base';
import {ParamType} from '../../engine/poly/ParamType';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {Color} from 'three/src/math/Color';
import {Number2, Number3, Number4} from '../../types/GlobalTypes';
import {ColorParam} from '../../engine/params/Color';
import {Vector4Param} from '../../engine/params/Vector4';
import {Vector2Param} from '../../engine/params/Vector2';
import {IntegerParam} from '../../engine/params/Integer';
import {CubicInterpolant} from 'three';

export class FloatParamProxy {
	public proxyValue: number;
	constructor(private param: FloatParam) {
		this.proxyValue = param.value;
	}
	update(interpolant?: CubicInterpolant) {
		if (interpolant) {
			const val = interpolant.evaluate(this.proxyValue)[0];
			this.param.set(val);
		} else {
			this.param.set(this.proxyValue);
		}
	}
}
export class IntegerParamProxy {
	public proxyValue: number;
	constructor(private param: IntegerParam) {
		this.proxyValue = param.value;
	}
	update() {
		this.param.set(this.proxyValue);
	}
}
export class Vector2ParamProxy {
	public proxyValue: Vector2 = new Vector2();
	private _array: Number2 = [0, 0];
	constructor(private param: Vector2Param) {
		this.proxyValue.copy(param.value);
	}
	update() {
		this.proxyValue.toArray(this._array);
		this.param.set(this._array);
	}
}

export class Vector3ParamProxy {
	public proxyValue: Vector3 = new Vector3();
	private _array: Number3 = [0, 0, 0];
	constructor(private param: Vector3Param) {
		this.proxyValue.copy(param.value);
	}
	update() {
		this.proxyValue.toArray(this._array);
		this.param.set(this._array);
	}
}

export class Vector4ParamProxy {
	public proxyValue: Vector4 = new Vector4();
	private _array: Number4 = [0, 0, 0, 0];
	constructor(private param: Vector4Param) {
		this.proxyValue.copy(param.value);
	}
	update() {
		this.proxyValue.toArray(this._array);
		this.param.set(this._array);
	}
}
export class ColorParamProxy {
	public proxyValue: Color = new Color();
	private _array: Number3 = [0, 0, 0];
	constructor(private param: ColorParam) {
		this.proxyValue.copy(param.valuePreConversion());
	}
	update() {
		this.proxyValue.toArray(this._array);
		this.param.set(this._array);
	}
}

type AnimationParamProxy =
	| FloatParamProxy
	| IntegerParamProxy
	| Vector2ParamProxy
	| Vector3ParamProxy
	| ColorParamProxy
	| Vector4ParamProxy;

export class AnimationNodeParamsProxy {
	private _map: Map<BaseParamType, AnimationParamProxy> = new Map();
	constructor(node: BaseNodeType) {
		const params = node.params.all;
		for (let param of params) {
			const paramProxy = this._createParamProxy(param);
			if (paramProxy) {
				this._map.set(param, paramProxy);
			}
		}
	}
	private _createParamProxy(param: BaseParamType) {
		switch (param.type()) {
			case ParamType.INTEGER: {
				return new IntegerParamProxy(param as IntegerParam);
			}
			case ParamType.FLOAT: {
				return new FloatParamProxy(param as FloatParam);
			}
			case ParamType.VECTOR2: {
				return new Vector2ParamProxy(param as Vector2Param);
			}
			case ParamType.VECTOR3: {
				return new Vector3ParamProxy(param as Vector3Param);
			}
			case ParamType.COLOR: {
				return new ColorParamProxy(param as ColorParam);
			}
			case ParamType.VECTOR4: {
				return new Vector4ParamProxy(param as Vector4Param);
			}
		}
	}

	getParamProxy(param: BaseParamType) {
		return this._map.get(param);
	}
}

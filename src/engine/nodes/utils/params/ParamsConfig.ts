// import {BaseNode} from 'src/engine/nodes/_Base';
import {ParamType} from 'src/engine/poly/ParamType';
import {ParamOptions} from 'src/engine/params/utils/OptionsController';
import {ParamInitValuesTypeMap, ParamValuesTypeMap, ParamConstructorMap} from './ParamsController';

// function _ParamCheckNameConsistency<T extends BaseNode>(name: string, target: T, key: keyof T, type: ParamType) {
// 	const key_s = key as string;
// 	if (key_s != `_param_${name}`) {
// 		console.warn('param name inconsistent');
// 	}
// 	const param = target.params.get(name);
// 	if (param && param.type != type) {
// 		console.warn('param type inconsistent');
// 	}
// }
// export const _ParamBoolean = function ParamF(name: string) {
// 	return <T extends BaseNode>(target: T, key: keyof T) => {
// 		_ParamCheckNameConsistency(name, target, key, ParamType.BOOLEAN);
// 		Object.defineProperty(target, key, {
// 			get: () => target.params.boolean(name),
// 		});
// 	};
// };
// export const _ParamFloat = function ParamF(name: string) {
// 	return <T extends BaseNode>(target: T, key: keyof T) => {
// 		_ParamCheckNameConsistency(name, target, key, ParamType.FLOAT);
// 		Object.defineProperty(target, key, {
// 			get: () => target.params.float(name),
// 		});
// 	};
// };
export const _ParamFloat = function ParamF(default_value: number, options?: ParamOptions) {
	return <T extends NodeParamsConfig>(target: T, key: string) => {
		// _ParamCheckNameConsistency(name, target, key, ParamType.FLOAT);
		// const config = new ParamConfig(ParamType.FLOAT, default_value, options);
		// target.add_config(key, config);
		// target.set_default_value(key, default_value);
		// target.set_options(key, options);
		// Object.defineProperty(target.options, key, {
		// 	get: () => target.params.float(name),
		// });
	};
};
// export const _ParamString = function ParamF(name: string) {
// 	return <T extends BaseNode>(target: T, key: keyof T) => {
// 		_ParamCheckNameConsistency(name, target, key, ParamType.STRING);
// 		Object.defineProperty(target, key, {
// 			get: () => target.params.string(name),
// 		});
// 	};
// };
// export const _ParamVector2 = function ParamF(name: string) {
// 	return <T extends BaseNode>(target: T, key: keyof T) => {
// 		_ParamCheckNameConsistency(name, target, key, ParamType.VECTOR2);
// 		Object.defineProperty(target, key, {
// 			get: () => target.params.vector2(name),
// 		});
// 	};
// };
// export const _ParamVector3 = function ParamF(name: string) {
// 	return <T extends BaseNode>(target: T, key: keyof T) => {
// 		_ParamCheckNameConsistency(name, target, key, ParamType.VECTOR3);
// 		Object.defineProperty(target, key, {
// 			get: () => target.params.vector3(name),
// 		});
// 	};
// };
// export const _ParamColor = function ParamF(name: string) {
// 	return <T extends BaseNode>(target: T, key: keyof T) => {
// 		_ParamCheckNameConsistency(name, target, key, ParamType.COLOR);
// 		Object.defineProperty(target, key, {
// 			get: () => target.params.color(name),
// 		});
// 	};
// };
// declare global {
// 	const ParamB: typeof _ParamBoolean;
// 	const ParamF: typeof _ParamFloat;
// 	const ParamS: typeof _ParamString;
// 	const ParamV2: typeof _ParamVector2;
// 	const ParamV3: typeof _ParamVector3;
// 	const ParamC: typeof _ParamColor;
// }
// class ParamConfig<T extends ParamType> {
// 	constructor(readonly type: T, readonly default_value: ParamValuesTypeMap[T], readonly options: ParamOptions = {}) {}
// }
export class ParamTemplate<T extends ParamType> {
	readonly value_type: ParamValuesTypeMap[T];
	readonly param_class: ParamConstructorMap[T];
	// readonly options?: ParamOptions;

	constructor(public type: T, public init_value: ParamInitValuesTypeMap[T], public options?: ParamOptions) {}
}

// class Test1 {
// 	a: number
// 	b: string
// }
// type test = Extract<typeof Test1, string>;
// type test2 = Pick<typeof Test1, 'b'>;
// type test3 = Test1['b'];
// type test2 = keyof BoxSopParamConfig;
export class ParamConfig {
	// static _GENERIC<T extends ParamType> (type: T, init_value: ParamInitValuesTypeMap[T], options?: ParamOptions) {
	// 	return new ParamTemplate<T>(type, init_value, options);
	// }
	// static BUTTON(init_value: ParamInitValuesTypeMap[ParamType.BUTTON], options?: ParamOptions) {
	// 	return this._GENERIC<ParamType.BUTTON>(ParamType.BUTTON, init_value, options)
	// }
	static BUTTON(init_value: ParamInitValuesTypeMap[ParamType.BUTTON], options?: ParamOptions) {
		return new ParamTemplate<ParamType.BUTTON>(ParamType.BUTTON, init_value, options);
	}
	static BOOLEAN(init_value: ParamInitValuesTypeMap[ParamType.BOOLEAN], options?: ParamOptions) {
		return new ParamTemplate<ParamType.BOOLEAN>(ParamType.BOOLEAN, init_value, options);
	}
	static COLOR(init_value: ParamInitValuesTypeMap[ParamType.COLOR], options?: ParamOptions) {
		return new ParamTemplate<ParamType.COLOR>(ParamType.COLOR, init_value, options);
	}
	static FLOAT(init_value: ParamInitValuesTypeMap[ParamType.FLOAT], options?: ParamOptions) {
		return new ParamTemplate<ParamType.FLOAT>(ParamType.FLOAT, init_value, options);
	}
	static INTEGER(init_value: ParamInitValuesTypeMap[ParamType.INTEGER], options?: ParamOptions) {
		return new ParamTemplate<ParamType.INTEGER>(ParamType.INTEGER, init_value, options);
	}
	static OPERATOR_PATH(init_value: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH], options?: ParamOptions) {
		return new ParamTemplate<ParamType.OPERATOR_PATH>(ParamType.OPERATOR_PATH, init_value, options);
	}
	static STRING(init_value: ParamInitValuesTypeMap[ParamType.STRING], options?: ParamOptions) {
		return new ParamTemplate<ParamType.STRING>(ParamType.STRING, init_value, options);
	}
	static VECTOR2(init_value: ParamInitValuesTypeMap[ParamType.VECTOR2], options?: ParamOptions) {
		return new ParamTemplate<ParamType.VECTOR2>(ParamType.VECTOR2, init_value, options);
	}
	static VECTOR3(init_value: ParamInitValuesTypeMap[ParamType.VECTOR3], options?: ParamOptions) {
		return new ParamTemplate<ParamType.VECTOR3>(ParamType.VECTOR3, init_value, options);
	}
	static VECTOR4(init_value: ParamInitValuesTypeMap[ParamType.VECTOR4], options?: ParamOptions) {
		return new ParamTemplate<ParamType.VECTOR4>(ParamType.VECTOR4, init_value, options);
	}
}

export class NodeParamsConfig implements Dictionary<ParamTemplate<ParamType>> {
	[name: string]: ParamTemplate<ParamType>;
}

// interface ParamConfig {
// 	type: ParamType;
// 	value: any;
// 	options?: ParamOptions;
// }
// export type ParamConfigsArray = ParamConfig[];

// declare global {
// 	interface Window {
// 		ParamB: typeof _ParamB;
// 		ParamC: typeof _ParamC;
// 	}
// }
// window.ParamC = _ParamC;

import {Number2, Number3, Number4} from '../../../../types/GlobalTypes';
import {ParamType} from '../../../poly/ParamType';
import {ParamOptions} from '../../../params/utils/OptionsController';
import {RampParam} from '../../../params/Ramp';
import {ParamValuesTypeMap} from '../../../params/types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from '../../../params/types/ParamInitValuesTypeMap';
import {ParamConstructorMap} from '../../../params/types/ParamConstructorMap';
import {ParamOptionsByTypeMap} from '../../../params/types/ParamOptionsByTypeMap';
import {Color} from 'three/src/math/Color';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';

export class ParamTemplate<T extends ParamType> {
	readonly value_type!: ParamValuesTypeMap[T];
	readonly param_class!: ParamConstructorMap[T];

	constructor(public type: T, public init_value: ParamInitValuesTypeMap[T], public options?: ParamOptions) {}
}

export class ParamConfig {
	static BUTTON(
		init_value: ParamInitValuesTypeMap[ParamType.BUTTON],
		options?: ParamOptionsByTypeMap[ParamType.BUTTON]
	) {
		return new ParamTemplate<ParamType.BUTTON>(ParamType.BUTTON, init_value, options);
	}
	static BOOLEAN(
		init_value: ParamInitValuesTypeMap[ParamType.BOOLEAN],
		options?: ParamOptionsByTypeMap[ParamType.BOOLEAN]
	) {
		return new ParamTemplate<ParamType.BOOLEAN>(ParamType.BOOLEAN, init_value, options);
	}
	static COLOR(
		init_value: ParamInitValuesTypeMap[ParamType.COLOR],
		options?: ParamOptionsByTypeMap[ParamType.COLOR]
	) {
		if (init_value instanceof Color) {
			init_value = init_value.toArray() as Number3;
		}
		return new ParamTemplate<ParamType.COLOR>(ParamType.COLOR, init_value, options);
	}
	static FLOAT(
		init_value: ParamInitValuesTypeMap[ParamType.FLOAT],
		options?: ParamOptionsByTypeMap[ParamType.FLOAT]
	) {
		return new ParamTemplate<ParamType.FLOAT>(ParamType.FLOAT, init_value, options);
	}
	static FOLDER(
		init_value: ParamInitValuesTypeMap[ParamType.FOLDER] = null,
		options?: ParamOptionsByTypeMap[ParamType.FOLDER]
	) {
		return new ParamTemplate<ParamType.FOLDER>(ParamType.FOLDER, init_value, options);
	}
	static INTEGER(
		init_value: ParamInitValuesTypeMap[ParamType.INTEGER],
		options?: ParamOptionsByTypeMap[ParamType.INTEGER]
	) {
		return new ParamTemplate<ParamType.INTEGER>(ParamType.INTEGER, init_value, options);
	}
	static RAMP(
		init_value: ParamInitValuesTypeMap[ParamType.RAMP] = RampParam.DEFAULT_VALUE,
		options?: ParamOptionsByTypeMap[ParamType.RAMP]
	) {
		return new ParamTemplate<ParamType.RAMP>(ParamType.RAMP, init_value, options);
	}

	static STRING(
		init_value: ParamInitValuesTypeMap[ParamType.STRING] = '',
		options?: ParamOptionsByTypeMap[ParamType.STRING]
	) {
		return new ParamTemplate<ParamType.STRING>(ParamType.STRING, init_value, options);
	}
	static VECTOR2(
		init_value: ParamInitValuesTypeMap[ParamType.VECTOR2],
		options?: ParamOptionsByTypeMap[ParamType.VECTOR2]
	) {
		if (init_value instanceof Vector2) {
			init_value = init_value.toArray() as Number2;
		}
		return new ParamTemplate<ParamType.VECTOR2>(ParamType.VECTOR2, init_value, options);
	}
	static VECTOR3(
		init_value: ParamInitValuesTypeMap[ParamType.VECTOR3],
		options?: ParamOptionsByTypeMap[ParamType.VECTOR3]
	) {
		if (init_value instanceof Vector3) {
			init_value = init_value.toArray() as Number3;
		}
		return new ParamTemplate<ParamType.VECTOR3>(ParamType.VECTOR3, init_value, options);
	}
	static VECTOR4(
		init_value: ParamInitValuesTypeMap[ParamType.VECTOR4],
		options?: ParamOptionsByTypeMap[ParamType.VECTOR4]
	) {
		if (init_value instanceof Vector4) {
			init_value = init_value.toArray() as Number4;
		}
		return new ParamTemplate<ParamType.VECTOR4>(ParamType.VECTOR4, init_value, options);
	}

	//
	//
	// PATH PARAMS
	//
	//
	static OPERATOR_PATH(
		init_value: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH],
		options?: ParamOptionsByTypeMap[ParamType.OPERATOR_PATH]
	) {
		return new ParamTemplate<ParamType.OPERATOR_PATH>(ParamType.OPERATOR_PATH, init_value, options);
	}
	static NODE_PATH(
		init_value: ParamInitValuesTypeMap[ParamType.NODE_PATH],
		options?: ParamOptionsByTypeMap[ParamType.NODE_PATH]
	) {
		return new ParamTemplate<ParamType.NODE_PATH>(ParamType.NODE_PATH, init_value, options);
	}
	static PARAM_PATH(
		init_value: ParamInitValuesTypeMap[ParamType.PARAM_PATH],
		options?: ParamOptionsByTypeMap[ParamType.PARAM_PATH]
	) {
		return new ParamTemplate<ParamType.PARAM_PATH>(ParamType.PARAM_PATH, init_value, options);
	}
}

//
// NodeParamsConfig:
//
// export class NodeParamsConfig implements PolyDictionary<ParamTemplate<ParamType>> {
// 	[name: string]: ParamTemplate<ParamType>;
// }
// in order to have all param names validated by typescript, this definition of NodeParamsConfig could be used:
export class NodeParamsConfig {}

// but it will lead to some type error in ParamsValueAccessorType and ParamsAccessorType, preventing compilation with it.
// TODO: try and find a way that prevents node.p.nonExistingAttribute to be accessible, and that has not other compilation error

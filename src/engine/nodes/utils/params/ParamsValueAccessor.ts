import {NodeParamsConfig} from './ParamsConfig';
// import {ParamValuesTypeMap} from './ParamsController';
// import {ParamType} from 'src/engine/poly/ParamType';

// function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
// 	return o[propertyName]; // o[propertyName] is of type T[K]
// }

// let t: getProperty(ParamConfig, 'type')
// function prop<T, K extends keyof T>(obj: T, key: K) {
// 	return typeof obj[key];
// }
// type test = Pick<ParamConfig<ParamType.FLOAT>, 'default_value'>;

export type ParamsValueAccessorType<T extends NodeParamsConfig> = {
	readonly [P in keyof T]: T[P]['value_type'];
};

export class ParamsValueAccessor<T extends NodeParamsConfig> {
	constructor() {
		// console.log('accessor', this);
	}
}

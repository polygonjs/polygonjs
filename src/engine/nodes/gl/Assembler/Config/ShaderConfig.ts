import {ShaderName} from 'src/engine/nodes/utils/shaders/ShaderName';

export class ShaderConfig {
	constructor(private _name: ShaderName, private _input_names: string[], private _dependencies: ShaderName[]) {}

	name() {
		return this._name;
	}
	input_names() {
		return this._input_names;
	}
	dependencies() {
		return this._dependencies;
	}
}

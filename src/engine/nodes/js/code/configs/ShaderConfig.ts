import {JsFunctionName} from '../../../utils/shaders/ShaderName';

export class JsShaderConfig {
	constructor(private _name: JsFunctionName, private _input_names: string[], private _dependencies: JsFunctionName[]) {}

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

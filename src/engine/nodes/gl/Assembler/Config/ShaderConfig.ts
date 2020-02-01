export class ShaderConfig {

	constructor(
		private _name: string,
		private _input_names: string[],
		private _dependencies: string[]
		){
	}

	name(){
		return this._name
	}
	input_names(){
		return this._input_names
	}
	dependencies(){
		return this._dependencies
	}

}
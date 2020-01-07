export class NamedConnection {
	constructor(
		protected _name: string,
		) {
	}
	name(){return this._name}

	to_json(){
		return {name: this._name}
	}
}


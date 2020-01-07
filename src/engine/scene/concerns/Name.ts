export function Name<TBase extends Constructor>(Base: TBase) {
	return class extends Base {
		_uuid: string
		_name: string

		set_uuid(uuid: string){
			return this._uuid = uuid;
		}
		uuid() {
			return this._uuid;
		}
		set_name(name: string){
			return this._name = name;
		}
		name() {
			return this._name;
		}

	}
}


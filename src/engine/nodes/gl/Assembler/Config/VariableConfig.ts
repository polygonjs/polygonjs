interface VariableConfigOptions {
	// asset refererences
	default_from_attribute?: boolean;
	default?: string;
	if?: boolean;
	prefix?: string;
	suffix?: string;
}

export class VariableConfig {
	constructor(private _name: string, private _options: VariableConfigOptions = {}) {}

	name() {
		return this._name;
	}
	default_from_attribute() {
		return this._options['default_from_attribute'] || false;
	}
	default() {
		return this._options['default'];
	}
	if_condition() {
		return this._options['if'];
	}
	// required_definitions(){
	// 	return this._options['required_definitions']
	// }
	prefix() {
		return this._options['prefix'] || '';
	}
	suffix() {
		return this._options['suffix'] || '';
	}
}

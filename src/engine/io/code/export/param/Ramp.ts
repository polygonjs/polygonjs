import {ParamCodeExporter} from '../Param'

export class ParamRampCodeExporter extends ParamCodeExporter {

	default_value(){
		return JSON.stringify( this._param.default_value().to_json() )
	}

	add_main() {
		let val = this._param.value();
		const json = val.to_json()
		const line = this.prefix() + `.set('${JSON.stringify(json)}')`;
		this._lines.push(line)
	}


}

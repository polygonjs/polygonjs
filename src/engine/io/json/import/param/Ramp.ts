import {ParamJsonImporter} from '../Param'
import {RampValue} from 'src/Engine/Param/Ramp/RampValue'

export class ParamRampJsonImporter extends ParamJsonImporter {

	add_main(data) {
		let value = data['value']
		if(value){
			const ramp_value = RampValue.from_json(value)
			this._param.set(ramp_value)
		}

	}


}

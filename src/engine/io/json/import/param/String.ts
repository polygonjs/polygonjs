import lodash_isString from 'lodash/isString'
import {ParamJsonImporter} from '../Param'

const LINE_BREAK_REGEXP = /\\n+/g

export class ParamStringJsonImporter extends ParamJsonImporter {

	add_main(data) {
		let value = data['value']
		if(value !== undefined){
			if(lodash_isString(value)){
				value = value.replace(LINE_BREAK_REGEXP, '\n')
				this._param.set(value)
			}
		}

	}


}

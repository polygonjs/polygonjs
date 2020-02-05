import lodash_isString from 'lodash/isString';
import {ParamJsonImporter} from '../Param';
import {ParamJsonExporterData} from '../../export/Param';
import {StringParam} from 'src/engine/params/String';

const LINE_BREAK_REGEXP = /\\n+/g;

export class ParamStringJsonImporter extends ParamJsonImporter<StringParam> {
	add_main(data: ParamJsonExporterData) {
		let value = data['value'];
		if (value !== undefined) {
			if (lodash_isString(value)) {
				value = value.replace(LINE_BREAK_REGEXP, '\n');
				this._param.set(value);
			}
		}
	}
}

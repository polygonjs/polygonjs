// import lodash_isString from 'lodash/isString';
import {ParamJsonImporter} from '../Param';
import {ComplexParamJsonExporterData} from '../../export/Param';
import {StringParam} from 'src/engine/params/String';
import {ParamType} from 'src/engine/poly/ParamType';

const LINE_BREAK_REGEXP = /\\n+/g;

export class ParamStringJsonImporter extends ParamJsonImporter<StringParam> {
	add_main(data: ComplexParamJsonExporterData<ParamType.STRING>) {
		let raw_input = data['raw_input'];
		if (raw_input !== undefined) {
			// if (lodash_isString(value)) {
			raw_input = raw_input.replace(LINE_BREAK_REGEXP, '\n');
			this._param.set(raw_input);
			// }
		}
	}
}

// https://ocjs.org/docs/advanced/exceptions/catch-exceptions

import type {OpenCascadeInstance} from './CadCommon';

type Callback = () => void;
export function withCadException(oc: OpenCascadeInstance, callback: Callback) {
	try {
		return callback();
	} catch (e) {
		if (typeof e === 'number') {
			const exceptionData = oc.OCJS.getStandard_FailureData(e);
			console.log(`That didn't work because: ${exceptionData.GetMessageString()}`);
			console.log(e, exceptionData);
		} else {
			console.log('Unkown error');
			console.log(e);
		}
	}
}

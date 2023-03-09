// https://ocjs.org/docs/advanced/exceptions/catch-exceptions

import type {OpenCascadeInstance} from './CadCommon';
import {CadLoaderSync} from './CadLoaderSync';

type Callback = () => void;
export function withCadException<T>(oc: OpenCascadeInstance, callback: Callback): T | void {
	try {
		return callback();
	} catch (e) {
		const message = cadProcessError(e);
		console.log(`That didn't work because: ${message}`);
		console.log(e, message);
		// if (typeof e === 'number') {
		// 		const exceptionData = oc.OCJS.getStandard_FailureData(e);
		// 	} else {
		// 		console.log('Unkown error');
		// 		console.log(e);
		// 	}
		// }
	}
}
interface ErrorWithMessage {
	message: string;
}

export function cadProcessError(e: unknown) {
	const oc = CadLoaderSync.oc();
	console.warn(e, typeof e === 'number');
	if (typeof e === 'number') {
		const exceptionData = oc.OCJS.getStandard_FailureData(e);
		console.log(exceptionData.GetMessageString());
		return exceptionData.GetMessageString();
		// console.log(`That didn't work because: ${exceptionData.GetMessageString()}`);
		// console.log(e, exceptionData);
	} else {
		const message = (e as ErrorWithMessage).message;
		console.log(e, message);
		if (typeof message === 'string') {
			return message;
		} else {
			console.log(e);
			return 'Unknow CAD Error';
		}
	}
}

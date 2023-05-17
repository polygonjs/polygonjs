import {createVariable} from '../nodes/js/code/assemblers/_BaseJsPersistedConfigUtils';
import {JsConnectionPointType} from '../nodes/utils/io/connections/Js';

export function _matchArrayLength<T1, T2>(src: T1[], target: T2[], _createElement: () => T2): void {
	_setArrayLength(target, src.length, _createElement);
	// if (target.length == src.length) {
	// 	return;
	// }
	// if (target.length > src.length) {
	// 	target.length = src.length;
	// } else {
	// 	const srcLength = src.length;
	// 	for (let i = target.length; i < srcLength; i++) {
	// 		target[i] = _createElement();
	// 	}
	// }
}
export function _setArrayLength<T>(target: T[], length: number, _createElement: () => T): void {
	if (target.length == length) {
		return;
	}
	if (target.length > length) {
		target.length = length;
	} else {
		const srcLength = length;
		for (let i = target.length; i < srcLength; i++) {
			target[i] = _createElement();
		}
	}
}
export function _matchArrayLengthWithType<T1, T2>(src: T1[], target: T2[], type: JsConnectionPointType): void {
	if (target.length == src.length) {
		return;
	}
	if (target.length > src.length) {
		target.length = src.length;
	} else {
		const srcLength = src.length;
		for (let i = target.length; i < srcLength; i++) {
			target[i] = createVariable(type) as T2;
		}
	}
}

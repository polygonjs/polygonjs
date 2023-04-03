export function _matchArrayLength<T1, T2>(src: T1[], target: T2[], _createElement: () => T2): void {
	if (target.length == src.length) {
		return;
	}
	if (target.length > src.length) {
		target.length = src.length;
	} else {
		const srcLength = src.length;
		for (let i = target.length; i < srcLength; i++) {
			target[i] = _createElement();
		}
	}
}

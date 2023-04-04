import {Ref} from '@vue/reactivity';
import {incrementRefSafely, ref} from '../../core/reactivity/CoreReactivity';

const refByIndex: Map<number, Ref<number>> = new Map();
export function getOrCreateWebXRTrackerRef(index: number) {
	return getWebXRTrackerRef(index) || createWebXRTrackerRef(index);
}
export function getWebXRTrackerRef(index: number) {
	return refByIndex.get(index);
}
export function createWebXRTrackerRef(index: number) {
	let refForIndex = refByIndex.get(index);
	if (!refForIndex) {
		refForIndex = ref(0);
		refByIndex.set(index, refForIndex);
	}
	return refForIndex;
}

export function touchWebXRTrackerRef(index: number) {
	const _ref = getWebXRTrackerRef(index);
	if (!_ref) {
		return;
	}
	incrementRefSafely(_ref);
}

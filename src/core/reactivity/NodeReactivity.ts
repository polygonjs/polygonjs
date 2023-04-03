import {Ref} from '@vue/reactivity';
import {incrementRefSafely, ref} from '../../core/reactivity/CoreReactivity';

const refByNodePath: Map<string, Ref<number>> = new Map();
export function getOrCreateNodeRef(nodePath: string) {
	return getNodeRef(nodePath) || createNodeRef(nodePath);
}
export function getNodeRef(nodePath: string) {
	return refByNodePath.get(nodePath);
}
export function createNodeRef(nodePath: string) {
	let refForNodePath = refByNodePath.get(nodePath);
	if (!refForNodePath) {
		refForNodePath = ref(0);
		refByNodePath.set(nodePath, refForNodePath);
	}
	return refForNodePath;
}

export function touchNodeRef(nodePath: string) {
	const _ref = getNodeRef(nodePath);
	if (!_ref) {
		return;
	}
	incrementRefSafely(_ref);
}

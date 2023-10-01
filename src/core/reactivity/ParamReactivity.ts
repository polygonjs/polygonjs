import {Ref} from '@vue/reactivity';
import {incrementRefSafely, ref} from '../../core/reactivity/CoreReactivity';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {BaseParamType} from '../../engine/params/_Base';

const refByNodePathByParamName: Map<string, Map<string, Ref<number>>> = new Map();
export function getOrCreateParamRef(node: BaseNodeType, paramName: string) {
	return getParamRef(node, paramName) || createParamRef(node, paramName);
}
export function getParamRef(node: BaseNodeType, paramName: string) {
	return refByNodePathByParamName.get(node.path())?.get(paramName);
}
export function createParamRef(node: BaseNodeType, paramName: string) {
	let mapForNode = refByNodePathByParamName.get(node.path());
	if (!mapForNode) {
		mapForNode = new Map();
		refByNodePathByParamName.set(node.path(), mapForNode);
	}
	let refForParam = mapForNode.get(paramName);
	if (!refForParam) {
		refForParam = ref(0);
		mapForNode.set(paramName, refForParam);
	}
	return refForParam;
}

export function touchParamRef(node: BaseNodeType, paramName: string) {
	const _ref = getParamRef(node, paramName);
	if (!_ref) {
		return;
	}
	incrementRefSafely(_ref);
}
export function touchParamRefFromParam(param: BaseParamType) {
	if (!param.node) {
		return;
	}
	const _ref = getParamRef(param.node, param.name());
	if (!_ref) {
		return;
	}
	incrementRefSafely(_ref);
}

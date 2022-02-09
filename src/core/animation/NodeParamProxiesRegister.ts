import {BaseNodeType} from '../../engine/nodes/_Base';
import {BaseParamType} from '../../engine/params/_Base';
import {AnimationNodeParamsProxy} from './ParamProxy';

class NodeParamProxiesRegisterClass {
	private static _instance: NodeParamProxiesRegisterClass;
	static instance() {
		return (this._instance = this._instance || new NodeParamProxiesRegisterClass());
	}
	private _map: Map<BaseNodeType, AnimationNodeParamsProxy> = new Map();
	private constructor() {}

	nodeProxy(node: BaseNodeType) {
		const existingProxy = this._map.get(node);
		if (existingProxy) {
			return existingProxy;
		}
		const newProxy = new AnimationNodeParamsProxy(node);
		this._map.set(node, newProxy);
		return newProxy;
	}
	paramProxy(param: BaseParamType) {
		return this.nodeProxy(param.node).getParamProxy(param);
	}
}
export const NodeParamProxiesRegister = NodeParamProxiesRegisterClass.instance();

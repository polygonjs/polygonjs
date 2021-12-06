// import {Constructor, valueof} from '../../../types/GlobalTypes';
// import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
// import {AnimNodeChildrenMap} from '../../poly/registers/nodes/Anim';
// import {ParamsInitData} from '../utils/io/IOController';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {TypedNode} from '../_Base';
// import {BaseAnimNodeType} from './_Base';

// type Test<K extends NodeContext, P extends NodeParamsConfig> = TypedNode<K, any>;
// export function AnimNetworkNodeMixin<TBase extends Constructor<Test<any, any>>>(Base: TBase) {
// 	return class Mixin extends Base {
// 		static type(): Readonly<NetworkNodeType.ANIM> {
// 			return NetworkNodeType.ANIM;
// 		}

// 		protected _childrenControllerContext = NodeContext.ANIM;

// 		createNode<S extends keyof AnimNodeChildrenMap>(
// 			node_class: S,
// 			params_init_value_overrides?: ParamsInitData
// 		): AnimNodeChildrenMap[S];
// 		createNode<K extends valueof<AnimNodeChildrenMap>>(
// 			node_class: Constructor<K>,
// 			params_init_value_overrides?: ParamsInitData
// 		): K;
// 		createNode<S extends keyof AnimNodeChildrenMap, K extends valueof<AnimNodeChildrenMap>>(
// 			node_class: S | Constructor<K>,
// 			params_init_value_overrides?: ParamsInitData
// 		): K | AnimNodeChildrenMap[S] {
// 			return super.createNode(node_class, params_init_value_overrides) as K | AnimNodeChildrenMap[S];
// 		}
// 		children() {
// 			return super.children() as BaseAnimNodeType[];
// 		}
// 		nodesByType<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K][] {
// 			return super.nodesByType(type) as AnimNodeChildrenMap[K][];
// 		}
// 	};
// }

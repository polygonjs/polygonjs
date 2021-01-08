// import {Constructor, valueof} from '../../../types/GlobalTypes';
// import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
// import {CopNodeChildrenMap} from '../../poly/registers/nodes/Cop';
// import {ParamsInitData} from '../utils/io/IOController';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {TypedNode} from '../_Base';
// import {BaseCopNodeType} from './_Base';

// type Test<K extends NodeContext, P extends NodeParamsConfig> = TypedNode<K, any>;
// export function CopNetworkNodeMixin<TBase extends Constructor<Test<any, any>>>(Base: TBase) {
// 	return class Mixin extends Base {
// 		static type(): Readonly<NetworkNodeType.COP> {
// 			return NetworkNodeType.COP;
// 		}

// 		protected _children_controller_context = NodeContext.COP;

// 		createNode<S extends keyof CopNodeChildrenMap>(
// 			node_class: S,
// 			params_init_value_overrides?: ParamsInitData
// 		): CopNodeChildrenMap[S];
// 		createNode<K extends valueof<CopNodeChildrenMap>>(
// 			node_class: Constructor<K>,
// 			params_init_value_overrides?: ParamsInitData
// 		): K;
// 		createNode<S extends keyof CopNodeChildrenMap, K extends valueof<CopNodeChildrenMap>>(
// 			node_class: S | Constructor<K>,
// 			params_init_value_overrides?: ParamsInitData
// 		): K | CopNodeChildrenMap[S] {
// 			return super.createNode(node_class, params_init_value_overrides) as K | CopNodeChildrenMap[S];
// 		}
// 		children() {
// 			return super.children() as BaseCopNodeType[];
// 		}
// 		nodesByType<K extends keyof CopNodeChildrenMap>(type: K): CopNodeChildrenMap[K][] {
// 			return super.nodesByType(type) as CopNodeChildrenMap[K][];
// 		}
// 	};
// }

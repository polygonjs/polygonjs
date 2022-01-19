// import {valueof} from '../../../types/GlobalTypes';
// import {NodeContext} from '../../poly/NodeContext';
// import {AnimNodeChildrenMap} from '../../poly/registers/nodes/Anim';
// import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {TypedNode} from '../_Base';
// import {BaseAnimNodeType} from './_Base';

// type Test<K extends NodeContext, P extends NodeParamsConfig> = TypedNode<K, P>;
// export type Constructor<T = Test<any, any>> = new (...args: any[]) => T;

// // type ReturnedVal = {
// // 	new (...args: any[]): Test<any, any>;
// // } & Constructor;

// export function AnimNetworkNodeMixin<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		public readonly _childrenControllerContext = NodeContext.ANIM;

// 		createNode<S extends keyof AnimNodeChildrenMap>(
// 			nodeClass: S,
// 			options?: NodeCreateOptions
// 		): AnimNodeChildrenMap[S];
// 		createNode<K extends valueof<AnimNodeChildrenMap>>(nodeClass: Constructor<K>, options?: NodeCreateOptions): K;
// 		createNode<K extends valueof<AnimNodeChildrenMap>>(nodeClass: Constructor<K>, options?: NodeCreateOptions): K {
// 			return super.createNode(nodeClass, options) as K;
// 		}
// 		children() {
// 			return super.children() as BaseAnimNodeType[];
// 		}
// 		nodesByType<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K][] {
// 			return super.nodesByType(type) as AnimNodeChildrenMap[K][];
// 		}
// 	};
// }

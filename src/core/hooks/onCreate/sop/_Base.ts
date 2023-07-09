import {GeoNodeChildrenMap} from '../../../../engine/poly/registers/nodes/Sop';
import {NodeContext} from '../../../../engine/poly/NodeContext';
import {BaseOnCreateHookRegister} from '../BaseOnCreateHookRegister';

export class SopOnCreateHookRegister<T extends keyof GeoNodeChildrenMap> extends BaseOnCreateHookRegister<
	NodeContext.SOP,
	T
> {
	override context(): NodeContext.SOP {
		return NodeContext.SOP;
	}
	override onCreate(node: GeoNodeChildrenMap[T]) {}
}

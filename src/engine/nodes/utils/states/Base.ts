import {NodeContext} from '../../../poly/NodeContext';
import {TypedNode} from '../../_Base';

export class NodeBaseState<NC extends NodeContext> {
	constructor(protected node: TypedNode<NC, any>) {}
}

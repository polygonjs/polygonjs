import {NodeContext} from '../../../poly/NodeContext';
import {PolyNodeDefinition} from './PolyNodeDefinition';

export interface PolyNodeDataRegister<NC extends NodeContext> {
	node_context: NC;
	node_type: string;
	data: PolyNodeDefinition;
}

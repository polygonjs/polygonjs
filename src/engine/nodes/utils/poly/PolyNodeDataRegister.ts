import {NodeContext} from '../../../poly/NodeContext';
import {PolyNodeDefinition} from './PolyNodeDefinition';

export interface PolyNodeDataRegister<NC extends NodeContext> {
	context: NC;
	type: string;
	data: PolyNodeDefinition;
}

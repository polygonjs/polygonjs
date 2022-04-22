import {NodeContext} from '../../poly/NodeContext';
import {PolyNodeController} from '../utils/poly/PolyNodeController';
import {BaseSubnetAnimNode} from './Subnet';
import {createPolyAnimNode} from './utils/poly/createPolyAnimNode';

export const BasePolyAnimNode = createPolyAnimNode(
	'poly',
	{
		nodeContext: NodeContext.ANIM,
		inputs: {simple: {min: 0, max: 4}},
	},
	PolyNodeController
);
export class PolyAnimNode extends BaseSubnetAnimNode<any> {}

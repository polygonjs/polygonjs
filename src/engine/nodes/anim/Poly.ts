import {NodeContext} from '../../poly/NodeContext';
import {PolyNodeController} from '../utils/poly/PolyNodeController';
import {BaseSubnetAnimNode} from './Subnet';
import {createPolyAnimNode} from './utils/poly/createPolyAnimNode';

export const BasePolyAnimNode = createPolyAnimNode(
	'poly',
	{
		metadata: {
			version: {
				polygonjs: '1',
			},
			createdAt: 1,
		},
		nodeContext: NodeContext.ANIM,
		inputs: {simple: {min: 0, max: 4, names: []}},
	},
	PolyNodeController
);
export class PolyAnimNode extends BaseSubnetAnimNode<any> {}

import {NodeContext} from '../../poly/NodeContext';
import {PolyNodeController} from '../utils/poly/PolyNodeController';
import {createPolySopNode} from './utils/poly/createPolySopNode';

export const BasePolySopNode = createPolySopNode(
	'poly',
	{
		metadata: {
			version: {
				polygonjs: '1',
			},
			createdAt: 1,
		},
		nodeContext: NodeContext.SOP,
		inputs: {simple: {min: 0, max: 4, names: []}},
	},
	PolyNodeController
);
export class PolySopNode extends BasePolySopNode<any> {}

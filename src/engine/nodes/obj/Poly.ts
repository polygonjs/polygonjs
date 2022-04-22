import {NodeContext} from '../../poly/NodeContext';
import {PolyNodeController} from '../utils/poly/PolyNodeController';
import {createPolyObjNode} from './utils/poly/createPolyObjNode';

export const BasePolyObjNode = createPolyObjNode('poly', {nodeContext: NodeContext.OBJ}, PolyNodeController);
export class PolyObjNode extends BasePolyObjNode<any, any> {}

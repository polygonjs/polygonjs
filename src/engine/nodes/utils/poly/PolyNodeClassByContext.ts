import {NodeContext} from '../../../poly/NodeContext';
// we do not import those types as they do not seem necessary
// and it bloats the bundle.
// import {BasePolySopNode} from '../../sop/Poly';
// import {BasePolyObjNode} from '../../obj/Poly';

type PolyNodeClassByContextMapGeneric = {[key in NodeContext]: any};
export interface PolyNodeClassByContext extends PolyNodeClassByContextMapGeneric {
	[NodeContext.ANIM]: undefined;
	[NodeContext.AUDIO]: undefined;
	[NodeContext.COP]: undefined;
	[NodeContext.EVENT]: undefined;
	[NodeContext.GL]: undefined;
	[NodeContext.JS]: undefined;
	[NodeContext.MANAGER]: undefined;
	[NodeContext.MAT]: undefined;
	[NodeContext.OBJ]: undefined; //typeof BasePolyObjNode;
	[NodeContext.ROP]: undefined;
	[NodeContext.SOP]: undefined; //typeof BasePolySopNode;
}

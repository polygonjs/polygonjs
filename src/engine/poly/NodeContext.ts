import {BaseSopNodeType} from '../nodes/sop/_Base';
import {BaseAnimNodeType} from '../nodes/anim/_Base';
import {BaseCopNodeType} from '../nodes/cop/_Base';
import {BaseEventNodeType} from '../nodes/event/_Base';
import {BaseGlNodeType} from '../nodes/gl/_Base';
import {BaseManagerNodeType} from '../nodes/manager/_Base';
import {BaseMatNodeType} from '../nodes/mat/_Base';
import {BaseObjNodeType} from '../nodes/obj/_Base';
import {BasePostProcessNodeType} from '../nodes/post/_Base';
import {GeoNodeChildrenMap} from './registers/nodes/Sop';
import {GlNodeChildrenMap} from './registers/nodes/Gl';
import {EventNodeChildrenMap} from './registers/nodes/Event';
import {CopNodeChildrenMap} from './registers/nodes/Cop';
import {AnimNodeChildrenMap} from './registers/nodes/Anim';
import {MatNodeChildrenMap} from './registers/nodes/Mat';
import {PostNodeChildrenMap} from './registers/nodes/Post';
import {ObjNodeChildrenMap} from './registers/nodes/Obj';

export enum NodeContext {
	ANIM = 'anim',
	COP = 'cop',
	EVENT = 'event',
	GL = 'gl',
	// JS = 'js',
	MANAGER = 'managers',
	MAT = 'mat',
	OBJ = 'obj',
	POST = 'post',
	SOP = 'sop',
}

export interface BaseNodeByContextMap {
	[NodeContext.ANIM]: BaseAnimNodeType;
	[NodeContext.COP]: BaseCopNodeType;
	[NodeContext.EVENT]: BaseEventNodeType;
	[NodeContext.GL]: BaseGlNodeType;
	// [NodeContext.JS]: BaseJsNodeType;
	[NodeContext.MANAGER]: BaseManagerNodeType;
	[NodeContext.MAT]: BaseMatNodeType;
	[NodeContext.OBJ]: BaseObjNodeType;
	[NodeContext.POST]: BasePostProcessNodeType;
	[NodeContext.SOP]: BaseSopNodeType;
}
export interface ChildrenNodeMapByContextMap {
	[NodeContext.ANIM]: AnimNodeChildrenMap;
	[NodeContext.COP]: CopNodeChildrenMap;
	[NodeContext.EVENT]: EventNodeChildrenMap;
	[NodeContext.GL]: GlNodeChildrenMap;
	// [NodeContext.JS]: BaseGlNodeType;
	[NodeContext.MANAGER]: {};
	[NodeContext.MAT]: MatNodeChildrenMap;
	[NodeContext.OBJ]: ObjNodeChildrenMap;
	[NodeContext.POST]: PostNodeChildrenMap;
	[NodeContext.SOP]: GeoNodeChildrenMap;
}

export interface NodeContextAndType {
	context: NodeContext;
	type: string;
}

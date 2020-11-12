// nodes
import {BaseSopNodeType} from '../nodes/sop/_Base';
import {BaseAnimNodeType} from '../nodes/anim/_Base';
import {BaseCopNodeType} from '../nodes/cop/_Base';
import {BaseEventNodeType} from '../nodes/event/_Base';
import {BaseGlNodeType} from '../nodes/gl/_Base';
import {BaseJsNodeType} from '../nodes/js/_Base';
import {BaseManagerNodeType} from '../nodes/manager/_Base';
import {BaseMatNodeType} from '../nodes/mat/_Base';
import {BaseObjNodeType} from '../nodes/obj/_Base';
import {BasePostProcessNodeType} from '../nodes/post/_Base';
import {BaseRopNodeType} from '../nodes/rop/_Base';
// registers
import {GeoNodeChildrenMap} from './registers/nodes/Sop';
import {GlNodeChildrenMap} from './registers/nodes/Gl';
import {EventNodeChildrenMap} from './registers/nodes/Event';
import {CopNodeChildrenMap} from './registers/nodes/Cop';
import {AnimNodeChildrenMap} from './registers/nodes/Anim';
import {MatNodeChildrenMap} from './registers/nodes/Mat';
import {ObjNodeChildrenMap} from './registers/nodes/Obj';
import {PostNodeChildrenMap} from './registers/nodes/Post';
import {RopNodeChildrenMap} from './registers/nodes/Rop';

export enum NodeContext {
	ANIM = 'anim',
	COP = 'cop',
	EVENT = 'event',
	GL = 'gl',
	JS = 'js',
	MANAGER = 'manager',
	MAT = 'mat',
	OBJ = 'obj',
	POST = 'post',
	ROP = 'rop',
	SOP = 'sop',
}

export type NodeContextUnion =
	| NodeContext.ANIM
	| NodeContext.COP
	| NodeContext.EVENT
	| NodeContext.GL
	| NodeContext.JS
	| NodeContext.MANAGER
	| NodeContext.MAT
	| NodeContext.OBJ
	| NodeContext.POST
	| NodeContext.ROP
	| NodeContext.SOP;

export enum NetworkNodeType {
	ANIM = 'animations',
	COP = 'cop',
	EVENT = 'events',
	MAT = 'materials',
	POST = 'post_process',
	ROP = 'renderers',
}
export enum NetworkChildNodeType {
	INPUT = 'subnet_input',
	OUTPUT = 'subnet_output',
}
export enum CameraNodeType {
	PERSPECTIVE = 'perspective_camera',
	ORTHOGRAPHIC = 'orthographic_camera',
	MAPBOX = 'mapbox_camera',
}

export interface BaseNodeByContextMap {
	[NodeContext.ANIM]: BaseAnimNodeType;
	[NodeContext.COP]: BaseCopNodeType;
	[NodeContext.EVENT]: BaseEventNodeType;
	[NodeContext.GL]: BaseGlNodeType;
	[NodeContext.JS]: BaseJsNodeType;
	[NodeContext.MANAGER]: BaseManagerNodeType;
	[NodeContext.MAT]: BaseMatNodeType;
	[NodeContext.OBJ]: BaseObjNodeType;
	[NodeContext.POST]: BasePostProcessNodeType;
	[NodeContext.SOP]: BaseSopNodeType;
	[NodeContext.ROP]: BaseRopNodeType;
}
export interface ChildrenNodeMapByContextMap {
	[NodeContext.ANIM]: AnimNodeChildrenMap;
	[NodeContext.COP]: CopNodeChildrenMap;
	[NodeContext.EVENT]: EventNodeChildrenMap;
	[NodeContext.GL]: GlNodeChildrenMap;
	[NodeContext.JS]: BaseJsNodeType;
	[NodeContext.MANAGER]: {};
	[NodeContext.MAT]: MatNodeChildrenMap;
	[NodeContext.OBJ]: ObjNodeChildrenMap;
	[NodeContext.POST]: PostNodeChildrenMap;
	[NodeContext.SOP]: GeoNodeChildrenMap;
	[NodeContext.ROP]: RopNodeChildrenMap;
}

export interface NodeContextAndType {
	context: NodeContext;
	type: string;
}

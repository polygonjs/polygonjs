import {NodeContext} from '../../poly/NodeContext';
import {TypedContainer} from '../_Base';
import {AnimationContainer} from '../Animation';
import {AudioContainer} from '../Audio';
import {EventContainer} from '../Event';
import {GeometryContainer} from '../Geometry';
import {GlContainer} from '../Gl';
import {JsContainer} from '../Js';
import {ManagerContainer} from '../Manager';
import {MaterialContainer} from '../Material';
import {ObjectContainer} from '../Object';
import {TextureContainer} from '../Texture';
import {PostProcessContainer} from '../PostProcess';
import {RopContainer} from '../Rop';
import {CsgContainer} from '../Csg';
// import {TypedNode} from '../../nodes/_Base';
// import {BaseAnimNodeType} from '../../nodes/anim/_Base';
// import {BaseEventNodeType} from '../../nodes/event/_Base';
// import {BaseSopNodeType} from '../../nodes/sop/_Base';
// import {BaseGlNodeType} from '../../nodes/gl/_Base';
// import {BaseJsNodeType} from '../../nodes/js/_Base';
// import {BaseManagerNodeType} from '../../nodes/manager/_Base';
// import {BaseMatNodeType} from '../../nodes/mat/_Base';
// import {BaseObjNodeType} from '../../nodes/obj/_Base';
// import {BaseCopNodeType} from '../../nodes/cop/_Base';
// import {BasePostProcessNodeType} from '../../nodes/post/_Base';
// import {BaseRopNodeType} from '../../nodes/rop/_Base';
// import {BaseAudioNodeType} from '../../nodes/audio/_Base';

// export enum ContainerType {
// 	ANIMATION = 'ANIMATION',
// 	EVENT = 'EVENT',
// 	GEOMETRY = 'GEOMETRY',
// 	GL = 'GL',
// 	MANAGER = 'MANAGER',
// 	MATERIAL = 'MATERIAL',
// 	OBJECT = 'OBJECT',
// 	TEXTURE = 'TEXTURE',
// 	POST = 'POST',
// }
export type ContainerClassMapGeneric = {[key in NodeContext]: TypedContainer<key>};
export const ContainerClassMap = {
	[NodeContext.ACTOR]: AnimationContainer,
	[NodeContext.ANIM]: AnimationContainer,
	[NodeContext.AUDIO]: AudioContainer,
	[NodeContext.COP]: TextureContainer,
	[NodeContext.CSG]: CsgContainer,
	[NodeContext.EVENT]: EventContainer,
	[NodeContext.GL]: GlContainer,
	[NodeContext.JS]: JsContainer,
	[NodeContext.MANAGER]: ManagerContainer,
	[NodeContext.MAT]: MaterialContainer,
	[NodeContext.OBJ]: ObjectContainer,
	[NodeContext.ROP]: RopContainer,
	[NodeContext.POST]: PostProcessContainer,
	[NodeContext.SOP]: GeometryContainer,
	// JS: JsContainer;
};

// export type ContainerMap = {[key in NodeContext]: TypedContainer<key>};

type ContainerMapGeneric = {[key in NodeContext]: TypedContainer<key>};

export interface ContainerMap extends ContainerMapGeneric {
	[NodeContext.ANIM]: AnimationContainer;
	[NodeContext.AUDIO]: AudioContainer;
	[NodeContext.COP]: TextureContainer;
	[NodeContext.EVENT]: EventContainer;
	[NodeContext.GL]: GlContainer;
	[NodeContext.JS]: JsContainer;
	[NodeContext.MANAGER]: ManagerContainer;
	[NodeContext.MAT]: MaterialContainer;
	[NodeContext.OBJ]: ObjectContainer;
	[NodeContext.ROP]: RopContainer;
	[NodeContext.POST]: PostProcessContainer;
	[NodeContext.SOP]: GeometryContainer;
}

// export type NodeTypeMapGeneric = {[key in NodeContext]: TypedNode<key, any>};
// export interface NodeTypeMap extends NodeTypeMapGeneric {
// 	[NodeContext.ANIM]: BaseAnimNodeType;
// 	[NodeContext.AUDIO]: BaseAudioNodeType;
// 	[NodeContext.COP]: BaseCopNodeType;
// 	[NodeContext.EVENT]: BaseEventNodeType;
// 	[NodeContext.GL]: BaseGlNodeType;
// 	[NodeContext.JS]: BaseJsNodeType;
// 	[NodeContext.MANAGER]: BaseManagerNodeType;
// 	[NodeContext.MAT]: BaseMatNodeType;
// 	[NodeContext.OBJ]: BaseObjNodeType;
// 	[NodeContext.POST]: BasePostProcessNodeType;
// 	[NodeContext.ROP]: BaseRopNodeType;
// 	[NodeContext.SOP]: BaseSopNodeType;
// 	// JS: JsContainer;
// }
// export const NodeTypeMap: NodeTypeMapGeneric = {
// 		[NodeContext.ANIM]: BaseAnimNodeType,
// 	[NodeContext.EVENT]: TypedEventNode<any>,
// 	[NodeContext.SOP]: TypedSopNode<any>,
// 	[NodeContext.GL]: TypedGlNode<any>,
// 	[NodeContext.MANAGER]: TypedBaseManagerNode<any>,
// 	[NodeContext.MAT]: TypedMatNode<any, any>,
// 	[NodeContext.OBJ]: TypedObjNode<any, any>,
// 	[NodeContext.COP]: TypedCopNode<any>,
// 	[NodeContext.POST]: TypedPostProcessNode<any, any>,
// }

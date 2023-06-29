import {NodeContext} from '../../../poly/NodeContext';

export enum ShaderName {
	VERTEX = 'vertex',
	FRAGMENT = 'fragment',
	LEAVES_FROM_NODES_SHADER = 'leaves_from_nodes_shader',
	//
	// VELOCITY = 'velocity',
	// COLLIDER = 'collider',
}

export enum JsFunctionName {
	MAIN = 'main',
	VELOCITY = 'velocity',
	COLLIDER = 'collider',
}

export interface ShaderNameByContextMap {
	[NodeContext.GL]: ShaderName;
	[NodeContext.JS]: JsFunctionName;
	//
	[NodeContext.ANIM]: ShaderName;
	[NodeContext.AUDIO]: ShaderName;
	[NodeContext.COP]: ShaderName;
	[NodeContext.EVENT]: ShaderName;
	[NodeContext.MANAGER]: ShaderName;
	[NodeContext.MAT]: ShaderName;
	[NodeContext.OBJ]: ShaderName;
	[NodeContext.POST]: ShaderName;
	[NodeContext.SOP]: ShaderName;
	[NodeContext.ROP]: ShaderName;
}

import {CoreGroup} from '../../../core/geometry/Group';
import {Material, Texture, Object3D} from 'three';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {NodeContext} from '../../poly/NodeContext';

export interface ContainableMap {
	[NodeContext.ACTOR]: string;
	[NodeContext.ANIM]: TimelineBuilder;
	[NodeContext.AUDIO]: AudioBuilder;
	[NodeContext.COP]: Texture;
	[NodeContext.EVENT]: string;
	[NodeContext.GL]: string;
	[NodeContext.JS]: string;
	[NodeContext.MANAGER]: boolean;
	[NodeContext.MAT]: Material;
	[NodeContext.OBJ]: Object3D;
	[NodeContext.ROP]: any;
	[NodeContext.POST]: number;
	[NodeContext.SOP]: CoreGroup;
}

export const ContainableClassMap = {
	[NodeContext.ACTOR]: String,
	[NodeContext.ANIM]: TimelineBuilder,
	[NodeContext.AUDIO]: AudioBuilder,
	[NodeContext.COP]: Texture,
	[NodeContext.EVENT]: String,
	[NodeContext.GL]: String,
	[NodeContext.JS]: String,
	[NodeContext.MANAGER]: Boolean,
	[NodeContext.MAT]: Material,
	[NodeContext.OBJ]: Object3D,
	[NodeContext.ROP]: String,
	[NodeContext.POST]: Number,
	[NodeContext.SOP]: CoreGroup,
	// JS: JsContainer;
};

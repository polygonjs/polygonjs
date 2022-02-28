import {CoreGroup} from '../../../core/geometry/Group';
import {Material} from 'three/src/materials/Materials';
import {Texture} from 'three/src/textures/Texture';
import {Object3D} from 'three/src/core/Object3D';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {NodeContext} from '../../poly/NodeContext';
import {ActorBuilder} from '../../../core/actor/ActorBuilder';

export interface ContainableMap {
	[NodeContext.ACTOR]: ActorBuilder;
	[NodeContext.ANIM]: TimelineBuilder;
	[NodeContext.AUDIO]: AudioBuilder;
	[NodeContext.EVENT]: string;
	[NodeContext.SOP]: CoreGroup;
	[NodeContext.GL]: string;
	[NodeContext.JS]: string;
	[NodeContext.MANAGER]: boolean;
	[NodeContext.MAT]: Material;
	[NodeContext.COP]: Texture;
	[NodeContext.OBJ]: Object3D;
	[NodeContext.ROP]: any;
	[NodeContext.POST]: number;
}

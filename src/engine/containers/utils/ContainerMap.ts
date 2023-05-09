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

export type ContainerClassMapGeneric = {[key in NodeContext]: TypedContainer<key>};
export const ContainerClassMap = {
	[NodeContext.ANIM]: AnimationContainer,
	[NodeContext.AUDIO]: AudioContainer,
	[NodeContext.COP]: TextureContainer,
	[NodeContext.EVENT]: EventContainer,
	[NodeContext.GL]: GlContainer,
	[NodeContext.JS]: JsContainer,
	[NodeContext.MANAGER]: ManagerContainer,
	[NodeContext.MAT]: MaterialContainer,
	[NodeContext.OBJ]: ObjectContainer,
	[NodeContext.ROP]: RopContainer,
	[NodeContext.POST]: PostProcessContainer,
	[NodeContext.SOP]: GeometryContainer,
};

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

import {NodeContext} from '../../../../poly/NodeContext';
import {BaseConnectionPoint} from './_Base';
import {BaseEventConnectionPoint} from './Event';
import {BaseGlConnectionPoint} from './Gl';
import {BaseJsConnectionPoint} from './Js';

type ConnectionPointTypeMapGeneric = {[key in NodeContext]: BaseConnectionPoint};

export interface ConnectionPointTypeMap extends ConnectionPointTypeMapGeneric {
	[NodeContext.ANIM]: BaseConnectionPoint;
	[NodeContext.COP]: BaseConnectionPoint;
	[NodeContext.EVENT]: BaseEventConnectionPoint;
	[NodeContext.GL]: BaseGlConnectionPoint;
	[NodeContext.JS]: BaseJsConnectionPoint;
	[NodeContext.MANAGER]: BaseConnectionPoint;
	[NodeContext.MAT]: BaseConnectionPoint;
	[NodeContext.OBJ]: BaseConnectionPoint;
	[NodeContext.POST]: BaseConnectionPoint;
	[NodeContext.SOP]: BaseConnectionPoint;
}

import { NodeContext, NodeContextUnion } from '../../../../poly/NodeContext';
import { BaseGlConnectionPoint, GlConnectionPointType, GlConnectionPoint } from './Gl';
import { BaseJsConnectionPoint, JsConnectionPointType, JsConnectionPoint } from './Js';
import { BaseEventConnectionPoint, EventConnectionPoint, EventConnectionPointType } from './Event';
declare type ConnectionPointTypeMapGeneric = {
    [key in NodeContext]: BaseEventConnectionPoint | BaseGlConnectionPoint | BaseJsConnectionPoint | undefined;
};
export interface ConnectionPointTypeMap extends ConnectionPointTypeMapGeneric {
    [NodeContext.ANIM]: undefined;
    [NodeContext.COP]: undefined;
    [NodeContext.EVENT]: BaseEventConnectionPoint;
    [NodeContext.GL]: BaseGlConnectionPoint;
    [NodeContext.JS]: BaseJsConnectionPoint;
    [NodeContext.MANAGER]: undefined;
    [NodeContext.MAT]: undefined;
    [NodeContext.OBJ]: undefined;
    [NodeContext.POST]: undefined;
    [NodeContext.ROP]: undefined;
    [NodeContext.SOP]: undefined;
}
declare type ConnectionPointEnumMapGeneric = {
    [key in NodeContext]: EventConnectionPointType | GlConnectionPointType | JsConnectionPointType | undefined;
};
export interface ConnectionPointEnumMap extends ConnectionPointEnumMapGeneric {
    [NodeContext.ANIM]: undefined;
    [NodeContext.COP]: undefined;
    [NodeContext.EVENT]: EventConnectionPointType;
    [NodeContext.GL]: GlConnectionPointType;
    [NodeContext.JS]: JsConnectionPointType;
    [NodeContext.MANAGER]: undefined;
    [NodeContext.MAT]: undefined;
    [NodeContext.OBJ]: undefined;
    [NodeContext.POST]: undefined;
    [NodeContext.ROP]: undefined;
    [NodeContext.SOP]: undefined;
}
declare type IConnectionPointEnumMap = {
    [key in NodeContextUnion]: ConnectionPointEnumMap[key];
};
export declare const DEFAULT_CONNECTION_POINT_ENUM_MAP: IConnectionPointEnumMap;
export declare function create_connection_point<NC extends NodeContext>(context: NC, name: string, type: ConnectionPointEnumMap[NC]): EventConnectionPoint<EventConnectionPointType> | GlConnectionPoint<GlConnectionPointType> | JsConnectionPoint<JsConnectionPointType> | undefined;
export declare function param_type_to_connection_point_type_map<NC extends NodeContext>(context: NC): import("./Gl").IGLParamTypeToConnectionPointTypeMap | import("./Js").IJsParamTypeToConnectionPointTypeMap | undefined;
export {};

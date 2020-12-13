import {NodeContext as NodeContext2} from "../../../../poly/NodeContext";
import {
  GlConnectionPointType,
  GlConnectionPoint,
  GLParamTypeToConnectionPointTypeMap
} from "./Gl";
import {
  JsConnectionPointType,
  JsConnectionPoint,
  JsParamTypeToConnectionPointTypeMap
} from "./Js";
import {EventConnectionPoint, EventConnectionPointType} from "./Event";
export const DEFAULT_CONNECTION_POINT_ENUM_MAP = {
  [NodeContext2.ANIM]: void 0,
  [NodeContext2.COP]: void 0,
  [NodeContext2.EVENT]: EventConnectionPointType.BASE,
  [NodeContext2.GL]: GlConnectionPointType.FLOAT,
  [NodeContext2.JS]: JsConnectionPointType.FLOAT,
  [NodeContext2.MANAGER]: void 0,
  [NodeContext2.MAT]: void 0,
  [NodeContext2.OBJ]: void 0,
  [NodeContext2.POST]: void 0,
  [NodeContext2.ROP]: void 0,
  [NodeContext2.SOP]: void 0
};
export function create_connection_point(context, name, type) {
  switch (context) {
    case NodeContext2.EVENT: {
      return new EventConnectionPoint(name, type);
    }
    case NodeContext2.GL: {
      return new GlConnectionPoint(name, type);
    }
    case NodeContext2.JS: {
      return new JsConnectionPoint(name, type);
    }
    default: {
      return void 0;
    }
  }
}
export function param_type_to_connection_point_type_map(context) {
  switch (context) {
    case NodeContext2.EVENT: {
      return void 0;
    }
    case NodeContext2.GL: {
      return GLParamTypeToConnectionPointTypeMap;
    }
    case NodeContext2.JS: {
      return JsParamTypeToConnectionPointTypeMap;
    }
    default: {
      return void 0;
    }
  }
}

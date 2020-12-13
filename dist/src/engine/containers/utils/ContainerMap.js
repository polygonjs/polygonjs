import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {AnimationContainer} from "../Animation";
import {EventContainer} from "../Event";
import {GeometryContainer} from "../Geometry";
import {GlContainer} from "../Gl";
import {JsContainer} from "../Js";
import {ManagerContainer} from "../Manager";
import {MaterialContainer} from "../Material";
import {ObjectContainer} from "../Object";
import {TextureContainer} from "../Texture";
import {PostProcessContainer} from "../PostProcess";
import {RopContainer} from "../Rop";
export const ContainerClassMap = {
  [NodeContext2.ANIM]: AnimationContainer,
  [NodeContext2.COP]: TextureContainer,
  [NodeContext2.EVENT]: EventContainer,
  [NodeContext2.GL]: GlContainer,
  [NodeContext2.JS]: JsContainer,
  [NodeContext2.MANAGER]: ManagerContainer,
  [NodeContext2.MAT]: MaterialContainer,
  [NodeContext2.OBJ]: ObjectContainer,
  [NodeContext2.POST]: PostProcessContainer,
  [NodeContext2.ROP]: RopContainer,
  [NodeContext2.SOP]: GeometryContainer
};

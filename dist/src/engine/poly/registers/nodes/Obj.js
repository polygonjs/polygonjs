import {CATEGORY_OBJ} from "./Category";
import {AmbientLightObjNode} from "../../../nodes/obj/AmbientLight";
import {AreaLightObjNode} from "../../../nodes/obj/AreaLight";
import {DirectionalLightObjNode} from "../../../nodes/obj/DirectionalLight";
import {HemisphereLightObjNode} from "../../../nodes/obj/HemisphereLight";
import {PointLightObjNode} from "../../../nodes/obj/PointLight";
import {SpotLightObjNode} from "../../../nodes/obj/SpotLight";
import {AnimationsObjNode} from "../../../nodes/obj/Animations";
import {CopObjNode} from "../../../nodes/obj/Cop";
import {EventsObjNode} from "../../../nodes/obj/Events";
import {MaterialsObjNode} from "../../../nodes/obj/Materials";
import {PostProcessObjNode} from "../../../nodes/obj/PostProcess";
import {RenderersObjNode} from "../../../nodes/obj/Renderers";
import {BlendObjNode} from "../../../nodes/obj/Blend";
import {GeoObjNode} from "../../../nodes/obj/Geo";
import {NullObjNode} from "../../../nodes/obj/Null";
import {PolyObjNode} from "../../../nodes/obj/Poly";
import {RivetObjNode} from "../../../nodes/obj/Rivet";
import {SceneObjNode} from "../../../nodes/obj/Scene";
import {OrthographicCameraObjNode} from "../../../nodes/obj/OrthographicCamera";
import {PerspectiveCameraObjNode} from "../../../nodes/obj/PerspectiveCamera";
import {MapboxCameraObjNode} from "../../../nodes/obj/MapboxCamera";
export class ObjRegister {
  static run(poly) {
    poly.register_node(AmbientLightObjNode, CATEGORY_OBJ.LIGHT);
    poly.register_node(AreaLightObjNode, CATEGORY_OBJ.LIGHT);
    poly.register_node(DirectionalLightObjNode, CATEGORY_OBJ.LIGHT);
    poly.register_node(HemisphereLightObjNode, CATEGORY_OBJ.LIGHT);
    poly.register_node(PointLightObjNode, CATEGORY_OBJ.LIGHT);
    poly.register_node(SpotLightObjNode, CATEGORY_OBJ.LIGHT);
    poly.register_node(AnimationsObjNode, CATEGORY_OBJ.NETWORK);
    poly.register_node(CopObjNode, CATEGORY_OBJ.NETWORK);
    poly.register_node(EventsObjNode, CATEGORY_OBJ.NETWORK);
    poly.register_node(MaterialsObjNode, CATEGORY_OBJ.NETWORK);
    poly.register_node(PostProcessObjNode, CATEGORY_OBJ.NETWORK);
    poly.register_node(RenderersObjNode, CATEGORY_OBJ.NETWORK);
    poly.register_node(BlendObjNode, CATEGORY_OBJ.TRANSFORM);
    poly.register_node(GeoObjNode, CATEGORY_OBJ.GEOMETRY);
    poly.register_node(NullObjNode, CATEGORY_OBJ.TRANSFORM);
    poly.register_node(PolyObjNode, CATEGORY_OBJ.ADVANCED);
    poly.register_node(RivetObjNode, CATEGORY_OBJ.TRANSFORM);
    poly.register_node(SceneObjNode, CATEGORY_OBJ.ADVANCED);
    poly.register_node(MapboxCameraObjNode, CATEGORY_OBJ.CAMERA);
    poly.register_node(OrthographicCameraObjNode, CATEGORY_OBJ.CAMERA);
    poly.register_node(PerspectiveCameraObjNode, CATEGORY_OBJ.CAMERA);
  }
}

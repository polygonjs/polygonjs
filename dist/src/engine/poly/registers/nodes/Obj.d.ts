import { AmbientLightObjNode } from '../../../nodes/obj/AmbientLight';
import { AreaLightObjNode } from '../../../nodes/obj/AreaLight';
import { DirectionalLightObjNode } from '../../../nodes/obj/DirectionalLight';
import { HemisphereLightObjNode } from '../../../nodes/obj/HemisphereLight';
import { PointLightObjNode } from '../../../nodes/obj/PointLight';
import { SpotLightObjNode } from '../../../nodes/obj/SpotLight';
import { AnimationsObjNode } from '../../../nodes/obj/Animations';
import { CopObjNode } from '../../../nodes/obj/Cop';
import { EventsObjNode } from '../../../nodes/obj/Events';
import { MaterialsObjNode } from '../../../nodes/obj/Materials';
import { PostProcessObjNode } from '../../../nodes/obj/PostProcess';
import { RenderersObjNode } from '../../../nodes/obj/Renderers';
import { BlendObjNode } from '../../../nodes/obj/Blend';
import { GeoObjNode } from '../../../nodes/obj/Geo';
import { NullObjNode } from '../../../nodes/obj/Null';
import { PolyObjNode } from '../../../nodes/obj/Poly';
import { RivetObjNode } from '../../../nodes/obj/Rivet';
import { SceneObjNode } from '../../../nodes/obj/Scene';
import { OrthographicCameraObjNode } from '../../../nodes/obj/OrthographicCamera';
import { PerspectiveCameraObjNode } from '../../../nodes/obj/PerspectiveCamera';
import { MapboxCameraObjNode } from '../../../nodes/obj/MapboxCamera';
export interface ObjNodeChildrenMap {
    ambient_light: AmbientLightObjNode;
    animations: AnimationsObjNode;
    area_light: AreaLightObjNode;
    blend: BlendObjNode;
    cop: CopObjNode;
    directional_light: DirectionalLightObjNode;
    events: EventsObjNode;
    geo: GeoObjNode;
    hemisphere_light: HemisphereLightObjNode;
    mapbox_camera: MapboxCameraObjNode;
    materials: MaterialsObjNode;
    null: NullObjNode;
    orthographic_camera: OrthographicCameraObjNode;
    perspective_camera: PerspectiveCameraObjNode;
    point_light: PointLightObjNode;
    poly: PolyObjNode;
    post_process: PostProcessObjNode;
    renderers: RenderersObjNode;
    rivet: RivetObjNode;
    scene: SceneObjNode;
    spot_light: SpotLightObjNode;
}
import { Poly } from '../../../Poly';
export declare class ObjRegister {
    static run(poly: Poly): void;
}

import { AmbientLightObjNode } from '../../nodes/obj/AmbientLight';
import { AreaLightObjNode } from '../../nodes/obj/AreaLight';
import { DirectionalLightObjNode } from '../../nodes/obj/DirectionalLight';
import { HemisphereLightObjNode } from '../../nodes/obj/HemisphereLight';
import { PointLightObjNode } from '../../nodes/obj/PointLight';
import { SpotLightObjNode } from '../../nodes/obj/SpotLight';
import { EventsObjNode } from '../../nodes/obj/Events';
import { MaterialsObjNode } from '../../nodes/obj/Materials';
import { CopObjNode } from '../../nodes/obj/Cop';
import { PostProcessObjNode } from '../../nodes/obj/PostProcess';
import { GeoObjNode } from '../../nodes/obj/Geo';
import { NullObjNode } from '../../nodes/obj/Null';
import { FogObjNode } from '../../nodes/obj/Fog';
import { SceneObjNode } from '../../nodes/obj/Scene';
import { OrthographicCameraObjNode } from '../../nodes/obj/OrthographicCamera';
import { PerspectiveCameraObjNode } from '../../nodes/obj/PerspectiveCamera';
export interface ObjNodeChildrenMap {
    ambient_light: AmbientLightObjNode;
    area_light: AreaLightObjNode;
    cop: CopObjNode;
    directional_light: DirectionalLightObjNode;
    events: EventsObjNode;
    fog: FogObjNode;
    geo: GeoObjNode;
    hemisphere_light: HemisphereLightObjNode;
    materials: MaterialsObjNode;
    null: NullObjNode;
    orthographic_camera: OrthographicCameraObjNode;
    perspective_camera: PerspectiveCameraObjNode;
    point_light: PointLightObjNode;
    post_process: PostProcessObjNode;
    scene: SceneObjNode;
    spot_light: SpotLightObjNode;
}
import { Poly } from '../../Poly';
export declare class ObjRegister {
    static run(poly: Poly): void;
}

import 'qunit';
import { PolyScene } from '../../src/engine/scene/PolyScene';
import { ObjectsManagerNode } from '../../src/engine/nodes/manager/ObjectsManager';
import { PerspectiveCameraObjNode } from '../../src/engine/nodes/obj/PerspectiveCamera';
import { GeoObjNode } from '../../src/engine/nodes/obj/Geo';
import { MaterialsObjNode } from '../../src/engine/nodes/obj/Materials';
import { PostProcessObjNode } from '../../src/engine/nodes/obj/PostProcess';
import { CopObjNode } from '../../src/engine/nodes/obj/Cop';
declare global {
    interface Window {
        scene: PolyScene;
        root: ObjectsManagerNode;
        perspective_camera1: PerspectiveCameraObjNode;
        geo1: GeoObjNode;
        MAT: MaterialsObjNode;
        POST: PostProcessObjNode;
        COP: CopObjNode;
    }
}

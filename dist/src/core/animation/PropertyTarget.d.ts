import { PolyScene } from '../../engine/scene/PolyScene';
import { Object3D } from 'three/src/core/Object3D';
export declare class PropertyTarget {
    private _node_path;
    private _object_mask;
    clone(): PropertyTarget;
    set_node_path(node_path: string): void;
    set_object_mask(object_mask: string): void;
    objects(scene: PolyScene): Object3D[] | undefined;
    node(scene: PolyScene): import("../../engine/nodes/_Base").BaseNodeType | import("../../engine/nodes/manager/ObjectsManager").ObjectsManagerNode | null | undefined;
}

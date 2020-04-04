import { Camera } from 'three/src/cameras/Camera';
import { Vector2 } from 'three/src/math/Vector2';
import { TypedNode } from '../_Base';
import { PostProcessContainer } from '../../containers/PostProcess';
import { EffectComposer } from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import { BaseCameraObjNodeType } from '../obj/_BaseCamera';
import { NodeContext } from '../../poly/NodeContext';
import { TypedContainerController } from '../utils/ContainerController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare class TypedPostProcessNode<K extends NodeParamsConfig> extends TypedNode<'POST', BasePostProcessNodeType, K> {
    container_controller: TypedContainerController<PostProcessContainer>;
    static node_context(): NodeContext;
    initialize_node(): void;
    node_sibbling(name: string): BasePostProcessNodeType | null;
    set_render_pass(render_pass: any): void;
    apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCameraObjNodeType): void;
}
export declare type BasePostProcessNodeType = TypedPostProcessNode<NodeParamsConfig>;
export declare class BasePostProcessNodeClass extends TypedPostProcessNode<NodeParamsConfig> {
}

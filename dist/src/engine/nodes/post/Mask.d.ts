import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { MaskPass } from '../../../../modules/three/examples/jsm/postprocessing/MaskPass';
import { Scene } from 'three/src/scenes/Scene';
import { Camera } from 'three/src/cameras/Camera';
interface MaskPassWithContext extends MaskPass {
    context_scene: Scene;
    context_camera: Camera;
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class MaskPostParamsConfig extends NodeParamsConfig {
    override_scene: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    scene: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    override_camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    camera: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
}
export declare class MaskPostNode extends TypedPostProcessNode<MaskPassWithContext, MaskPostParamsConfig> {
    params_config: MaskPostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): MaskPassWithContext;
    update_pass(pass: MaskPassWithContext): void;
    private _update_scene;
    private _update_camera;
}
export {};

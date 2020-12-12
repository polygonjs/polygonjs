import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { TypedCopNode } from '../_Base';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
declare class BaseCopRendererCopParamsConfig extends NodeParamsConfig {
    use_camera_renderer: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class BaseCopRendererCopNode extends TypedCopNode<BaseCopRendererCopParamsConfig> {
    params_config: BaseCopRendererCopParamsConfig;
}
export declare class CopRendererController {
    private node;
    private _renderer;
    constructor(node: BaseCopRendererCopNode);
    renderer(): Promise<WebGLRenderer>;
    reset(): void;
    camera_renderer(): Promise<WebGLRenderer>;
    save_state(): void;
    make_linear(): void;
    restore_state(): void;
    private _create_renderer;
}
export {};

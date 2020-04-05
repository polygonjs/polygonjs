import { TypedEventNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { BaseCameraObjNodeType } from '../obj/_BaseCamera';
declare class PassEventParamsConfig extends NodeParamsConfig {
}
export declare class PassEventNode extends TypedEventNode<PassEventParamsConfig> {
    params_config: PassEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    process_event(event: Event, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType): void;
}
export {};

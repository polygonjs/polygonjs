import { TypedSopNode, BaseSopNodeType } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
import { GeometryContainer } from '../../containers/Geometry';
declare class ObjectMergeSopParamsConfig extends NodeParamsConfig {
    geometry: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
}
export declare class ObjectMergeSopNode extends TypedSopNode<ObjectMergeSopParamsConfig> {
    params_config: ObjectMergeSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_containers: CoreGroup[]): Promise<void>;
    import_input(geometry_node: BaseSopNodeType, container: GeometryContainer): void;
}
export {};

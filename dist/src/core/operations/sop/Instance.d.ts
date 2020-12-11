import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { TypedPathParamValue } from '../../Walker';
import { Mesh } from 'three/src/objects/Mesh';
import { Material } from 'three/src/materials/Material';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface InstanceSopParams extends DefaultOperationParams {
    attributes_to_copy: string;
    apply_material: boolean;
    material: TypedPathParamValue;
}
export declare class InstanceSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: InstanceSopParams;
    static readonly INPUT_CLONED_STATE: InputCloneMode[];
    static type(): Readonly<'instance'>;
    private _globals_handler;
    private _geometry;
    cook(input_contents: CoreGroup[], params: InstanceSopParams): Promise<CoreGroup>;
    private _get_material;
    _apply_material(object: Mesh, material: Material): Promise<void>;
    private _create_instance;
}
export {};

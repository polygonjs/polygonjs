import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { TypedPathParamValue } from '../../Walker';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface AttribFromTextureSopParams extends DefaultOperationParams {
    texture: TypedPathParamValue;
    uv_attrib: string;
    attrib: string;
    add: number;
    mult: number;
}
export declare class AttribFromTextureSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: AttribFromTextureSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'attrib_from_texture'>;
    cook(input_contents: CoreGroup[], params: AttribFromTextureSopParams): Promise<CoreGroup>;
    private _set_position_from_data_texture;
}
export {};

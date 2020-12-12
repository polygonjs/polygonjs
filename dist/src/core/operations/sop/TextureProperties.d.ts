import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface TexturePropertiesSopParams extends DefaultOperationParams {
    apply_to_children: boolean;
    tanisotropy: boolean;
    use_renderer_max_anisotropy: boolean;
    anisotropy: number;
    tmin_filter: boolean;
    min_filter: number;
    tmag_filter: boolean;
    mag_filter: number;
}
export declare class TexturePropertiesSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: TexturePropertiesSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'texture_properties'>;
    cook(input_contents: CoreGroup[], params: TexturePropertiesSopParams): Promise<CoreGroup>;
    private _update_object;
    private _update_material;
    private _update_texture;
    private _update_anisotropy;
    private _update_filter;
}
export {};

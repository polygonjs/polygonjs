import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { TypedPathParamValue } from '../../Walker';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface MaterialSopParams extends DefaultOperationParams {
    group: string;
    assign_mat: boolean;
    material: TypedPathParamValue;
    apply_to_children: boolean;
    clone_mat: boolean;
    share_uniforms: boolean;
    swap_current_tex: boolean;
    tex_src0: string;
    tex_dest0: string;
}
export declare class MaterialSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: MaterialSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'material'>;
    private _globals_handler;
    cook(input_contents: CoreGroup[], params: MaterialSopParams): Promise<CoreGroup>;
    private _apply_materials;
    private _old_mat_by_old_new_id;
    private _materials_by_uuid;
    private _swap_textures;
    private _apply_material;
    private _swap_texture;
}
export {};

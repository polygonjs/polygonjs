import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface AttribCopySopParams extends DefaultOperationParams {
    name: string;
    tnew_name: boolean;
    new_name: string;
    src_offset: number;
    dest_offset: number;
}
export declare class AttribCopySopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: AttribCopySopParams;
    static readonly INPUT_CLONED_STATE: InputCloneMode[];
    static type(): Readonly<'attrib_copy'>;
    cook(input_contents: CoreGroup[], params: AttribCopySopParams): CoreGroup;
    private copy_vertex_attribute_between_core_groups;
    private copy_vertex_attribute_between_geometries;
    private _fill_dest_array;
}
export {};

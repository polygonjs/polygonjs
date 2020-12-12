import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface ObjectPropertiesSopParams extends DefaultOperationParams {
    apply_to_children: boolean;
    tname: boolean;
    name: string;
    trender_order: boolean;
    render_order: number;
    frustrum_culled: boolean;
    matrix_auto_update: boolean;
    visible: boolean;
    cast_shadow: boolean;
    receive_shadow: boolean;
}
export declare class ObjectPropertiesSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: ObjectPropertiesSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'object_properties'>;
    cook(input_contents: CoreGroup[], params: ObjectPropertiesSopParams): CoreGroup;
    private _update_object;
}
export {};

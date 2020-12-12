import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
import { CoreGroup } from '../../geometry/Group';
interface Css2DObjectSopParams extends DefaultOperationParams {
    use_id_attrib: boolean;
    id: string;
    use_class_attrib: boolean;
    class_name: string;
    use_html_attrib: boolean;
    html: string;
    copy_attributes: boolean;
    attributes_to_copy: string;
}
export declare class Css2DObjectSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: Css2DObjectSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'css2d_object'>;
    cook(input_contents: CoreGroup[], params: Css2DObjectSopParams): CoreGroup;
    private _create_objects_from_input_points;
    private _create_object_from_scratch;
    private static create_css_object;
}
export {};

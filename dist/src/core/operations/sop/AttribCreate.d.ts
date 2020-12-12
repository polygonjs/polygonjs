import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector4 } from 'three/src/math/Vector4';
import { AttribType } from '../../geometry/Constant';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
import { CoreObject } from '../../geometry/Object';
interface AttribCreateSopParams extends DefaultOperationParams {
    group: string;
    class: number;
    type: number;
    name: string;
    size: number;
    value1: number;
    value2: Vector2;
    value3: Vector3;
    value4: Vector4;
    string: string;
}
export declare class AttribCreateSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: AttribCreateSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'attrib_create'>;
    cook(input_contents: CoreGroup[], params: AttribCreateSopParams): CoreGroup;
    private _add_attribute;
    add_point_attribute(attrib_type: AttribType, core_group: CoreGroup, params: AttribCreateSopParams): Promise<void>;
    add_object_attribute(attrib_type: AttribType, core_group: CoreGroup, params: AttribCreateSopParams): Promise<void>;
    add_numeric_attribute_to_points(core_object: CoreObject, params: AttribCreateSopParams): Promise<void>;
    add_numeric_attribute_to_object(core_objects: CoreObject[], params: AttribCreateSopParams): Promise<void>;
    add_string_attribute_to_points(core_object: CoreObject, params: AttribCreateSopParams): Promise<void>;
    add_string_attribute_to_object(core_objects: CoreObject[], params: AttribCreateSopParams): Promise<void>;
}
export {};

import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { Color } from 'three/src/math/Color';
interface ColorSopParams extends DefaultOperationParams {
    from_attribute: boolean;
    attrib_name: string;
    color: Color;
    as_hsv: boolean;
}
export declare class ColorSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: ColorSopParams;
    static type(): Readonly<'color'>;
    cook(input_contents: CoreGroup[], params: ColorSopParams): void;
}
export {};

import { BaseCopyStamp } from '../../utils/CopyStamp';
import { CorePoint } from '../../../../core/geometry/Point';
export declare class CopyStamp extends BaseCopyStamp {
    protected _point: CorePoint | undefined;
    set_point(point: CorePoint): void;
    value(attrib_name?: string): string | number | boolean | Vector2Like | ColorLike | Number2 | Number3 | Number4;
}

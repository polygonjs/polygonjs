import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../../core/geometry/Group';
interface SubdivideSopParams extends DefaultOperationParams {
    subdivisions: number;
}
export declare class SubdivideSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: SubdivideSopParams;
    static type(): Readonly<'subdivide'>;
    cook(input_contents: CoreGroup[], params: SubdivideSopParams): CoreGroup;
}
export {};

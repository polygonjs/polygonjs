import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../../core/geometry/Group';
interface PeakSopParams extends DefaultOperationParams {
    amount: number;
}
export declare class PeakSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: PeakSopParams;
    static type(): Readonly<'peak'>;
    cook(input_contents: CoreGroup[], params: PeakSopParams): CoreGroup;
}
export {};

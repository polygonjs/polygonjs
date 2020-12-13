import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
interface FileSopParams extends DefaultOperationParams {
    url: string;
}
export declare class FileSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: FileSopParams;
    static type(): Readonly<'file'>;
    cook(input_contents: CoreGroup[], params: FileSopParams): Promise<CoreGroup>;
    private _on_load;
    private _on_error;
    private _ensure_geometry_has_index;
}
export {};

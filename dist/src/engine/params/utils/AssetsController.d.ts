import { BaseParamType } from '../_Base';
export declare class AssetsController {
    protected param: BaseParamType;
    private _referenced_asset;
    constructor(param: BaseParamType);
    reset_referenced_asset(): void;
    mark_as_referencing_asset(url: string): void;
    referenced_asset(): string | null;
    is_referencing_asset(): boolean;
}

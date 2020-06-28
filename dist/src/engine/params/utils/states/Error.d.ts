import { BaseParamType } from '../../_Base';
export declare class ErrorState {
    private param;
    private _message;
    constructor(param: BaseParamType);
    set(message: string | undefined): void;
    get message(): string | undefined;
    clear(): void;
    get active(): boolean;
}

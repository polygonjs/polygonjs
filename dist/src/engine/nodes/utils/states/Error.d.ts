import { BaseState } from './Base';
export declare class ErrorState extends BaseState {
    private _message;
    set(message: string | undefined): void;
    get message(): string | undefined;
    clear(): void;
    get active(): boolean;
    protected on_update(): void;
}

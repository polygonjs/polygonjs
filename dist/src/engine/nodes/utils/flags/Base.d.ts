import { BaseNodeType } from '../../_Base';
declare type FlagHookCallback = () => void;
export declare class BaseFlag {
    protected node: BaseNodeType;
    protected _state: boolean;
    protected _hooks: FlagHookCallback[] | null;
    constructor(node: BaseNodeType);
    add_hook(hook: FlagHookCallback): void;
    protected on_update(): void;
    set(new_state: boolean): void;
    get active(): boolean;
    toggle(): void;
    run_hooks(): void;
}
export {};

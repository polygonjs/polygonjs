import { BaseNodeType } from '../_Base';
declare type Callback = () => void;
declare type CallbackWithChildNode = (child_node: BaseNodeType) => void;
export declare class LifeCycleController {
    protected node: BaseNodeType;
    protected _creation_completed: boolean;
    protected _on_child_add_hooks: CallbackWithChildNode[] | undefined;
    private _on_child_remove_hooks;
    private _on_create_hooks;
    private _on_add_hooks;
    private _on_delete_hooks;
    constructor(node: BaseNodeType);
    set_creation_completed(): void;
    get creation_completed(): boolean;
    add_on_child_add_hook(callback: CallbackWithChildNode): void;
    run_on_child_add_hooks(node: BaseNodeType): void;
    add_on_child_remove_hook(callback: CallbackWithChildNode): void;
    run_on_child_remove_hooks(node: BaseNodeType): void;
    add_on_create_hook(callback: Callback): void;
    run_on_create_hooks(): void;
    add_on_add_hook(callback: Callback): void;
    run_on_add_hooks(): void;
    add_delete_hook(callback: Callback): void;
    run_on_delete_hooks(): void;
    protected execute_hooks(hooks: Callback[] | undefined): void;
    protected execute_hooks_with_child_node(hooks: CallbackWithChildNode[] | undefined, child_node: BaseNodeType): void;
}
export {};

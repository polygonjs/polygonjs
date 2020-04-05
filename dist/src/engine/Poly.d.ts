import { BaseNodeClass } from './nodes/_Base';
import { PolyScene } from './scene/PolyScene';
import { RenderersController } from './poly/RenderersController';
import { NodesRegister, RegisterOptions, BaseNodeConstructor } from './poly/NodesRegister';
import { NodeContext } from './poly/NodeContext';
export declare class Poly {
    static _instance: Poly | undefined;
    renderers_controller: RenderersController;
    nodes_register: NodesRegister;
    scenes_by_uuid: Dictionary<PolyScene>;
    _env: string | undefined;
    static instance(): Poly;
    private constructor();
    register_node(node: BaseNodeConstructor, tab_menu_category?: string, options?: RegisterOptions): void;
    registered_nodes(parent_context: NodeContext, type: string): Dictionary<typeof BaseNodeClass>;
    in_worker_thread(): boolean;
    desktop_controller(): any;
    player_mode(): boolean;
    log(...args: any[]): void;
    set_env(env: string): void;
    get env(): string | undefined;
}

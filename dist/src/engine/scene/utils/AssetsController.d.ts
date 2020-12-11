import { StringParam } from '../../params/String';
export declare class SceneAssetsController {
    private _params_by_id;
    private _assets_root;
    register_param(param: StringParam): void;
    deregister_param(param: StringParam): void;
    traverse_params(callback: (param: StringParam) => void): void;
    assets_root(): string | null;
    set_assets_root(url: string | null): void;
}

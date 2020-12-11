import { BaseMethod } from './_Base';
import { MethodDependency } from '../MethodDependency';
import { BaseParamType } from '../../params/_Base';
interface AssetUrlResolverArgs {
    asset_name: string;
    param: BaseParamType;
    scene_uuid?: string;
}
declare type AssetUrlResolver = (args: AssetUrlResolverArgs) => Promise<string>;
export declare class AssetExpression extends BaseMethod {
    static _resolver: AssetUrlResolver;
    static set_url_resolver(resolver: AssetUrlResolver): void;
    static required_arguments(): string[][];
    process_arguments(args: any[]): Promise<string>;
    find_dependency(index_or_path: number | string): MethodDependency | null;
    request_asset_url(asset_name: string): Promise<string>;
}
export {};

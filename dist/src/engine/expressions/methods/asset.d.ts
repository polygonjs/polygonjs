import { BaseMethod } from './_Base';
import { MethodDependency } from '../MethodDependency';
declare type AssetUrlResolver = (asset_name: string, scene_uuid?: string) => string;
export declare class AssetExpression extends BaseMethod {
    static _resolver: AssetUrlResolver;
    static set_url_resolver(resolver: AssetUrlResolver): void;
    static required_arguments(): string[][];
    process_arguments(args: any[]): Promise<string>;
    find_dependency(index_or_path: number | string): MethodDependency | null;
    request_asset_url(name: string): Promise<string>;
}
export {};

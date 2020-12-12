import { BaseMethod } from './_Base';
import { MethodDependency } from '../MethodDependency';
export declare class ChExpression extends BaseMethod {
    protected _require_dependency: boolean;
    static required_arguments(): string[][];
    find_dependency(index_or_path: number | string): MethodDependency | null;
    process_arguments(args: any[]): Promise<any>;
}

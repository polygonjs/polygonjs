import { BaseParamType } from '../params/_Base';
export declare class MissingExpressionReference {
    private param;
    readonly path: string;
    constructor(param: BaseParamType, path: string);
    absolute_path(): string | null;
    matches_path(path: string): boolean;
    update_from_method_dependency_name_change(): void;
    resolve_missing_dependencies(): void;
}

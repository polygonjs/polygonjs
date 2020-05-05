import { BaseMethod } from './_Base';
import { MethodDependency } from '../MethodDependency';
import { GeometryContainer } from '../../containers/Geometry';
export declare class PointExpression extends BaseMethod {
    static required_arguments(): string[][];
    find_dependency(index_or_path: number | string): MethodDependency | null;
    process_arguments(args: any[]): Promise<any>;
    _get_value_from_container(container: GeometryContainer, attrib_name: string, point_index: number): string | number | boolean | Vector2Like | ColorLike | Number2 | Number3 | Number4 | null;
}

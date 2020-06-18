import { BaseMethod } from './_Base';
export declare class JsExpression extends BaseMethod {
    private _function;
    static required_arguments(): string[][];
    process_arguments(args: any[]): Promise<any>;
    private _create_function;
}

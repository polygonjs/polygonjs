import { BaseMethod } from './_Base';
export declare class StrConcat extends BaseMethod {
    static required_arguments(): any[];
    process_arguments(args: any[]): Promise<string>;
}

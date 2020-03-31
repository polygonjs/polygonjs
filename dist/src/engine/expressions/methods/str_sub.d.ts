import { BaseMethod } from './_Base';
export declare class StrSub extends BaseMethod {
    static required_arguments(): string[][];
    process_arguments(args: any[]): Promise<string>;
}

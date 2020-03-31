import { BaseMethod } from './_Base';
export declare class StrIndex extends BaseMethod {
    static required_arguments(): string[][];
    process_arguments(args: any[]): Promise<number>;
}

import { BaseMethod } from './_Base';
export declare class StrCharsCountExpression extends BaseMethod {
    static required_arguments(): string[][];
    process_arguments(args: any[]): Promise<number>;
}

import { BaseMethod } from './_Base';
export declare class Local extends BaseMethod {
    static required_arguments(): string[][];
    process_arguments(args: any[]): Promise<string>;
    request_asset_url(name: string): Promise<string>;
}

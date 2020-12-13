import { BaseCoreLogger } from './Base';
export declare class ConsoleLogger extends BaseCoreLogger {
    log(message?: any, ...optionalParams: any[]): void;
    warn(...args: any): void;
    error(...args: any): void;
}

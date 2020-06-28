import { BaseCoreLogger } from './Base';
export declare class TestLogger extends BaseCoreLogger {
    _lines: any[];
    log(message?: any, ...optionalParams: any[]): void;
    lines(): any[];
}

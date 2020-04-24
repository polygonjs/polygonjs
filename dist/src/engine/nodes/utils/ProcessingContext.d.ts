import { BaseNodeType } from '../_Base';
export declare class ProcessingContext {
    private _frame;
    constructor(node: BaseNodeType);
    copy(src_context: ProcessingContext): void;
    get frame(): number;
}

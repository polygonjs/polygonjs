import {BaseNodeType} from '../_Base';

export class ProcessingContext {
	private _frame: number;
	constructor(node: BaseNodeType) {}
	copy(src_context: ProcessingContext) {
		this._frame = src_context.frame;
	}
	get frame() {
		return this._frame;
	}
}

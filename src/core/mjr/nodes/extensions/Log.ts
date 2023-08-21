import {RunState} from '../Common';
import {Node} from '../Node';

export class LogNode extends Node {
	private msg: string | null = null;
	public override async load(elem: Element) {
		const msg = elem.getAttribute('message');

		if (!msg) {
			console.error(elem, 'message is required for <log> node');
			return false;
		}

		this.msg = msg;
		return true;
	}

	public reset(): void {}

	public run(): RunState {
		console.log(this.msg);
		return RunState.FAIL;
	}
}

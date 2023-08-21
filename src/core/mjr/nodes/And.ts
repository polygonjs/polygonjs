import {Branch} from './Branch';
import {RunState} from './Common';
export class AndNode extends Branch {
	private nextBreak = true;

	public override run() {
		if (!this.ip) {
			return RunState.FAIL;
		}
		for (; this.n < this.children.length; this.n++) {
			const node = this.children[this.n];
			if (node instanceof Branch) this.ip.current = node;
			const status = node.run();

			if (status === RunState.SUCCESS || status === RunState.HALT) {
				this.nextBreak = false;
				return status;
			}

			if (this.nextBreak) break;
			else this.nextBreak = true;
		}
		this.ip.current = this.ip.current?.parent || null;
		this.reset();
		return RunState.FAIL;
	}

	public override reset() {
		this.nextBreak = true;
		super.reset();
	}
}

import {BaseNodeType} from '../_Base';

import {BypassFlag} from './flags/Bypass';
import {DisplayFlag} from './flags/Display';

export class FlagsController {
	private _bypass: BypassFlag | undefined;
	private _display: DisplayFlag | undefined;
	constructor(protected node: BaseNodeType) {}

	// bypass
	add_bypass() {
		if (!this._bypass) {
			this._bypass = new BypassFlag(this.node);
		} else {
			console.warn('bypass flag already created', this.node);
		}
	}
	get bypass() {
		return this._bypass;
	}
	has_bypass(): boolean {
		return this._bypass != null;
	}

	// display
	add_display() {
		if (!this._display) {
			this._display = new DisplayFlag(this.node);
		} else {
			console.warn('display flag already created', this.node);
		}
	}
	get display() {
		return this._display;
	}
	has_display(): boolean {
		return this._display != null;
	}
}

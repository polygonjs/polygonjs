import {BaseNodeType} from '../_Base';

import {BypassFlag} from './flags/Bypass';
import {DisplayFlag} from './flags/Display';

export class FlagsController {
	public readonly bypass: DisplayFlag | undefined;
	public readonly display: BypassFlag | undefined;
	constructor(protected node: BaseNodeType) {}
	has_display(): boolean {
		return false;
	}
	has_bypass(): boolean {
		return false;
	}
}

function Display<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected node!: BaseNodeType;
		public display: DisplayFlag = new DisplayFlag(this.node);
		has_display(): boolean {
			return true;
		}
	};
}
function Bypass<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected node!: BaseNodeType;
		public readonly bypass: BypassFlag = new BypassFlag(this.node);
		has_bypass(): boolean {
			return true;
		}
	};
}

export class FlagsControllerD extends Display(FlagsController) {}
export class FlagsControllerB extends Bypass(FlagsController) {}
export class FlagsControllerDB extends Bypass(Display(FlagsController)) {}

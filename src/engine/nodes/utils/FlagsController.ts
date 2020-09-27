import {BaseNodeType} from '../_Base';
import {BypassFlag} from './flags/Bypass';
import {DisplayFlag} from './flags/Display';
import {OptimizeFlag} from './flags/Optimize';

export class FlagsController {
	public readonly bypass: DisplayFlag | undefined;
	public readonly display: BypassFlag | undefined;
	public readonly optimize: OptimizeFlag | undefined;
	constructor(protected node: BaseNodeType) {}
	has_display(): boolean {
		return false;
	}
	has_bypass(): boolean {
		return false;
	}
	has_optimize(): boolean {
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
function Optimize<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected node!: BaseNodeType;
		public readonly optimize: OptimizeFlag = new OptimizeFlag(this.node);
		has_optimize(): boolean {
			return true;
		}
	};
}

export class FlagsControllerD extends Display(FlagsController) {}
export class FlagsControllerB extends Bypass(FlagsController) {}
export class FlagsControllerDB extends Bypass(Display(FlagsController)) {}
export class FlagsControllerDBO extends Optimize(Bypass(Display(FlagsController))) {}

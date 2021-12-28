import {Constructor} from '../../../types/GlobalTypes';
import {BaseNodeType} from '../_Base';
import {BypassFlag} from './flags/Bypass';
import {DisplayFlag} from './flags/Display';
import {OptimizeFlag} from './flags/Optimize';

export class FlagsController {
	public readonly bypass: DisplayFlag | undefined;
	public readonly display: BypassFlag | undefined;
	public readonly optimize: OptimizeFlag | undefined;
	constructor(public readonly node: BaseNodeType) {}
	hasDisplay(): boolean {
		return false;
	}
	hasBypass(): boolean {
		return false;
	}
	hasOptimize(): boolean {
		return false;
	}
}

function Display<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		public readonly node!: BaseNodeType;
		public display: DisplayFlag = new DisplayFlag(this.node);
		hasDisplay(): boolean {
			return true;
		}
	};
}
function Bypass<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		public readonly node!: BaseNodeType;
		public readonly bypass: BypassFlag = new BypassFlag(this.node);
		hasBypass(): boolean {
			return true;
		}
	};
}
function Optimize<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		public readonly node!: BaseNodeType;
		public readonly optimize: OptimizeFlag = new OptimizeFlag(this.node);
		hasOptimize(): boolean {
			return true;
		}
	};
}

export class FlagsControllerD extends Display(FlagsController) {}
export class FlagsControllerB extends Bypass(FlagsController) {}
export class FlagsControllerDB extends Bypass(Display(FlagsController)) {}
export class FlagsControllerBO extends Optimize(Bypass(FlagsController)) {}
export class FlagsControllerDBO extends Optimize(Bypass(Display(FlagsController))) {}

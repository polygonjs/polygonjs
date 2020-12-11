import {BypassFlag} from "./flags/Bypass";
import {DisplayFlag} from "./flags/Display";
import {OptimizeFlag} from "./flags/Optimize";
export class FlagsController {
  constructor(node) {
    this.node = node;
  }
  has_display() {
    return false;
  }
  has_bypass() {
    return false;
  }
  has_optimize() {
    return false;
  }
}
function Display2(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.display = new DisplayFlag(this.node);
    }
    has_display() {
      return true;
    }
  };
}
function Bypass2(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.bypass = new BypassFlag(this.node);
    }
    has_bypass() {
      return true;
    }
  };
}
function Optimize2(Base2) {
  return class Mixin extends Base2 {
    constructor() {
      super(...arguments);
      this.optimize = new OptimizeFlag(this.node);
    }
    has_optimize() {
      return true;
    }
  };
}
export class FlagsControllerD extends Display2(FlagsController) {
}
export class FlagsControllerB extends Bypass2(FlagsController) {
}
export class FlagsControllerDB extends Bypass2(Display2(FlagsController)) {
}
export class FlagsControllerBO extends Optimize2(Bypass2(FlagsController)) {
}
export class FlagsControllerDBO extends Optimize2(Bypass2(Display2(FlagsController))) {
}

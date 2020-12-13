export var AnimNodeEasing;
(function(AnimNodeEasing2) {
  AnimNodeEasing2["NONE"] = "none";
  AnimNodeEasing2["POWER1"] = "power1";
  AnimNodeEasing2["POWER2"] = "power2";
  AnimNodeEasing2["POWER3"] = "power3";
  AnimNodeEasing2["POWER4"] = "power4";
  AnimNodeEasing2["BACK"] = "back";
  AnimNodeEasing2["ELASTIC"] = "elastic";
  AnimNodeEasing2["BOUNCE"] = "bounce";
  AnimNodeEasing2["SLOW"] = "slow";
  AnimNodeEasing2["STEPS"] = "steps";
  AnimNodeEasing2["CIRC"] = "circ";
  AnimNodeEasing2["EXPO"] = "expo";
  AnimNodeEasing2["SINE"] = "sine";
})(AnimNodeEasing || (AnimNodeEasing = {}));
export const EASINGS = [
  AnimNodeEasing.NONE,
  AnimNodeEasing.POWER1,
  AnimNodeEasing.POWER2,
  AnimNodeEasing.POWER3,
  AnimNodeEasing.POWER4,
  AnimNodeEasing.BACK,
  AnimNodeEasing.ELASTIC,
  AnimNodeEasing.BOUNCE,
  AnimNodeEasing.SLOW,
  AnimNodeEasing.STEPS,
  AnimNodeEasing.CIRC,
  AnimNodeEasing.EXPO,
  AnimNodeEasing.SINE
];
export var InOutMode;
(function(InOutMode2) {
  InOutMode2["IN"] = "in";
  InOutMode2["OUT"] = "out";
  InOutMode2["IN_OUT"] = "inOut";
})(InOutMode || (InOutMode = {}));
export const IN_OUT_MODES = [InOutMode.IN, InOutMode.OUT, InOutMode.IN_OUT];

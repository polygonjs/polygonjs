import {CATEGORY_ANIM} from "./Category";
import {CopyAnimNode} from "../../../nodes/anim/Copy";
import {DelayAnimNode} from "../../../nodes/anim/Delay";
import {DurationAnimNode} from "../../../nodes/anim/Duration";
import {EasingAnimNode} from "../../../nodes/anim/Easing";
import {MergeAnimNode} from "../../../nodes/anim/Merge";
import {NullAnimNode} from "../../../nodes/anim/Null";
import {OperationAnimNode} from "../../../nodes/anim/Operation";
import {PositionAnimNode} from "../../../nodes/anim/Position";
import {PropertyNameAnimNode} from "../../../nodes/anim/PropertyName";
import {PropertyValueAnimNode} from "../../../nodes/anim/PropertyValue";
import {RepeatAnimNode} from "../../../nodes/anim/Repeat";
import {SwitchAnimNode} from "../../../nodes/anim/Switch";
import {TargetAnimNode} from "../../../nodes/anim/Target";
export class AnimRegister {
  static run(poly) {
    poly.registerNode(CopyAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.registerNode(DelayAnimNode, CATEGORY_ANIM.TIMING);
    poly.registerNode(DurationAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.registerNode(EasingAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.registerNode(MergeAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.registerNode(NullAnimNode, CATEGORY_ANIM.MISC);
    poly.registerNode(OperationAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.registerNode(PositionAnimNode, CATEGORY_ANIM.TIMING);
    poly.registerNode(PropertyNameAnimNode, CATEGORY_ANIM.PROP);
    poly.registerNode(PropertyValueAnimNode, CATEGORY_ANIM.PROP);
    poly.registerNode(RepeatAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.registerNode(SwitchAnimNode, CATEGORY_ANIM.MISC);
    poly.registerNode(TargetAnimNode, CATEGORY_ANIM.PROP);
  }
}

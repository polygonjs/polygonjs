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
    poly.register_node(CopyAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.register_node(DelayAnimNode, CATEGORY_ANIM.TIMING);
    poly.register_node(DurationAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.register_node(EasingAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.register_node(MergeAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.register_node(NullAnimNode, CATEGORY_ANIM.MISC);
    poly.register_node(OperationAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.register_node(PositionAnimNode, CATEGORY_ANIM.TIMING);
    poly.register_node(PropertyNameAnimNode, CATEGORY_ANIM.PROP);
    poly.register_node(PropertyValueAnimNode, CATEGORY_ANIM.PROP);
    poly.register_node(RepeatAnimNode, CATEGORY_ANIM.MODIFIER);
    poly.register_node(SwitchAnimNode, CATEGORY_ANIM.MISC);
    poly.register_node(TargetAnimNode, CATEGORY_ANIM.PROP);
  }
}

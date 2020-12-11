import {AssetExpression} from "../../../expressions/methods/asset";
import {BboxExpression} from "../../../expressions/methods/bbox";
import {CentroidExpression} from "../../../expressions/methods/centroid";
import {ChExpression} from "../../../expressions/methods/ch";
import {CopyExpression} from "../../../expressions/methods/copy";
import {CopResExpression} from "../../../expressions/methods/cop_res";
import {JsExpression} from "../../../expressions/methods/js";
import {ObjectsCountExpression} from "../../../expressions/methods/objects_count";
import {OpdigitsExpression} from "../../../expressions/methods/opdigits";
import {PadzeroExpression} from "../../../expressions/methods/padzero";
import {PointExpression} from "../../../expressions/methods/point";
import {PointsCountExpression} from "../../../expressions/methods/points_count";
import {StrCharsCountExpression} from "../../../expressions/methods/str_chars_count";
import {StrConcatExpression} from "../../../expressions/methods/str_concat";
import {StrIndexExpression} from "../../../expressions/methods/str_index";
import {StrSubExpression} from "../../../expressions/methods/str_sub";
export class AllExpressionsRegister {
  static run(poly) {
    poly.expressions_register.register_expression(AssetExpression, "asset");
    poly.expressions_register.register_expression(BboxExpression, "bbox");
    poly.expressions_register.register_expression(CentroidExpression, "centroid");
    poly.expressions_register.register_expression(ChExpression, "ch");
    poly.expressions_register.register_expression(CopyExpression, "copy");
    poly.expressions_register.register_expression(CopResExpression, "cop_res");
    poly.expressions_register.register_expression(JsExpression, "js");
    poly.expressions_register.register_expression(ObjectsCountExpression, "objects_count");
    poly.expressions_register.register_expression(OpdigitsExpression, "opdigits");
    poly.expressions_register.register_expression(PadzeroExpression, "padzero");
    poly.expressions_register.register_expression(PointExpression, "point");
    poly.expressions_register.register_expression(PointsCountExpression, "points_count");
    poly.expressions_register.register_expression(StrCharsCountExpression, "str_chars_count");
    poly.expressions_register.register_expression(StrConcatExpression, "str_concat");
    poly.expressions_register.register_expression(StrIndexExpression, "str_index");
    poly.expressions_register.register_expression(StrSubExpression, "str_sub");
  }
}

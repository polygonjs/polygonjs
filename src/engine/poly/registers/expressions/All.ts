import {AssetExpression} from '../../../expressions/methods/asset';
import {BboxExpression} from '../../../expressions/methods/bbox';
import {CentroidExpression} from '../../../expressions/methods/centroid';
import {ChExpression} from '../../../expressions/methods/ch';
import {CopyExpression} from '../../../expressions/methods/copy';
import {CopResExpression} from '../../../expressions/methods/cop_res';
import {JsExpression} from '../../../expressions/methods/js';
import {ObjectsCountExpression} from '../../../expressions/methods/objects_count';
import {OpdigitsExpression} from '../../../expressions/methods/opdigits';
import {PadzeroExpression} from '../../../expressions/methods/padzero';
import {PointExpression} from '../../../expressions/methods/point';
import {PointsCountExpression} from '../../../expressions/methods/points_count';
import {StrCharsCountExpression} from '../../../expressions/methods/str_chars_count';
import {StrConcatExpression} from '../../../expressions/methods/str_concat';
import {StrIndexExpression} from '../../../expressions/methods/str_index';
import {StrSubExpression} from '../../../expressions/methods/str_sub';

import {BaseMethod} from '../../../expressions/methods/_Base';
export interface ExpressionMap extends Dictionary<typeof BaseMethod> {
	asset: typeof AssetExpression;
	bbox: typeof BboxExpression;
	centroid: typeof CentroidExpression;
	ch: typeof ChExpression;
	copy: typeof CopyExpression;
	cop_res: typeof CopResExpression;
	js: typeof JsExpression;
	objects_count: typeof ObjectsCountExpression;
	opdigits: typeof OpdigitsExpression;
	padzero: typeof PadzeroExpression;
	point: typeof PointExpression;
	points_count: typeof PointsCountExpression;
	str_chars_count: typeof StrCharsCountExpression;
	str_concat: typeof StrConcatExpression;
	str_index: typeof StrIndexExpression;
	str_sub: typeof StrSubExpression;
}

import {Poly} from '../../../Poly';
export class AllExpressionsRegister {
	static run(poly: Poly) {
		poly.expressionsRegister.register(AssetExpression, 'asset');
		poly.expressionsRegister.register(BboxExpression, 'bbox');
		poly.expressionsRegister.register(CentroidExpression, 'centroid');
		poly.expressionsRegister.register(ChExpression, 'ch');
		poly.expressionsRegister.register(CopyExpression, 'copy');
		poly.expressionsRegister.register(CopResExpression, 'cop_res');
		poly.expressionsRegister.register(JsExpression, 'js');
		poly.expressionsRegister.register(ObjectsCountExpression, 'objects_count');
		poly.expressionsRegister.register(OpdigitsExpression, 'opdigits');
		poly.expressionsRegister.register(PadzeroExpression, 'padzero');
		poly.expressionsRegister.register(PointExpression, 'point');
		poly.expressionsRegister.register(PointsCountExpression, 'points_count');
		poly.expressionsRegister.register(StrCharsCountExpression, 'str_chars_count');
		poly.expressionsRegister.register(StrConcatExpression, 'str_concat');
		poly.expressionsRegister.register(StrIndexExpression, 'str_index');
		poly.expressionsRegister.register(StrSubExpression, 'str_sub');
	}
}

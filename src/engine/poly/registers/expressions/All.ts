import {AssetExpression} from '../../../expressions/methods/asset';
import {BboxExpression} from '../../../expressions/methods/bbox';
import {CentroidExpression} from '../../../expressions/methods/centroid';
import {ChExpression} from '../../../expressions/methods/ch';
import {CopyExpression} from '../../../expressions/methods/copy';
import {CopResExpression} from '../../../expressions/methods/copRes';
import {JsExpression} from '../../../expressions/methods/js';
import {ObjectsCountExpression} from '../../../expressions/methods/objectsCount';
import {OpdigitsExpression} from '../../../expressions/methods/opdigits';
import {PadzeroExpression} from '../../../expressions/methods/padzero';
import {PointExpression} from '../../../expressions/methods/point';
import {PointsCountExpression} from '../../../expressions/methods/pointsCount';
import {StrCharsCountExpression} from '../../../expressions/methods/strCharsCount';
import {StrConcatExpression} from '../../../expressions/methods/strConcat';
import {StrIndexExpression} from '../../../expressions/methods/strIndex';
import {StrSubExpression} from '../../../expressions/methods/strSub';

import {BaseMethod} from '../../../expressions/methods/_Base';
export interface ExpressionMap extends PolyDictionary<typeof BaseMethod> {
	asset: typeof AssetExpression;
	bbox: typeof BboxExpression;
	centroid: typeof CentroidExpression;
	ch: typeof ChExpression;
	copy: typeof CopyExpression;
	copRes: typeof CopResExpression;
	js: typeof JsExpression;
	objectsCount: typeof ObjectsCountExpression;
	opdigits: typeof OpdigitsExpression;
	padzero: typeof PadzeroExpression;
	point: typeof PointExpression;
	pointsCount: typeof PointsCountExpression;
	strCharsCount: typeof StrCharsCountExpression;
	strConcat: typeof StrConcatExpression;
	strIndex: typeof StrIndexExpression;
	strSub: typeof StrSubExpression;
}

import {Poly} from '../../../Poly';
import {PolyDictionary} from '../../../../types/GlobalTypes';
export class AllExpressionsRegister {
	static run(poly: Poly) {
		poly.expressionsRegister.register(AssetExpression, 'asset');
		poly.expressionsRegister.register(BboxExpression, 'bbox');
		poly.expressionsRegister.register(CentroidExpression, 'centroid');
		poly.expressionsRegister.register(ChExpression, 'ch');
		poly.expressionsRegister.register(CopyExpression, 'copy');
		poly.expressionsRegister.register(CopResExpression, 'copRes');
		poly.expressionsRegister.register(JsExpression, 'js');
		poly.expressionsRegister.register(ObjectsCountExpression, 'objectsCount');
		poly.expressionsRegister.register(OpdigitsExpression, 'opdigits');
		poly.expressionsRegister.register(PadzeroExpression, 'padzero');
		poly.expressionsRegister.register(PointExpression, 'point');
		poly.expressionsRegister.register(PointsCountExpression, 'pointsCount');
		poly.expressionsRegister.register(StrCharsCountExpression, 'strCharsCount');
		poly.expressionsRegister.register(StrConcatExpression, 'strConcat');
		poly.expressionsRegister.register(StrIndexExpression, 'strIndex');
		poly.expressionsRegister.register(StrSubExpression, 'strSub');
	}
}

import {ArgExpression} from '../../../expressions/methods/arg';
import {ArgcExpression} from '../../../expressions/methods/argc';
import {BboxExpression} from '../../../expressions/methods/bbox';
import {CentroidExpression} from '../../../expressions/methods/centroid';
import {ChExpression} from '../../../expressions/methods/ch';
import {CopyExpression} from '../../../expressions/methods/copy';
import {CopResExpression} from '../../../expressions/methods/copRes';
import {isDeviceMobileExpression} from '../../../expressions/methods/isDeviceMobile';
import {isDeviceTouchExpression} from '../../../expressions/methods/isDeviceTouch';
import {JsExpression} from '../../../expressions/methods/js';
import {ObjectExpression} from '../../../expressions/methods/object';
import {ObjectsCountExpression} from '../../../expressions/methods/objectsCount';
import {OpdigitsExpression} from '../../../expressions/methods/opdigits';
import {OpnameExpression} from '../../../expressions/methods/opname';
import {PadzeroExpression} from '../../../expressions/methods/padzero';
import {PointExpression} from '../../../expressions/methods/point';
import {PointsCountExpression} from '../../../expressions/methods/pointsCount';
import {StrCharsCountExpression} from '../../../expressions/methods/strCharsCount';
import {StrConcatExpression} from '../../../expressions/methods/strConcat';
import {StrIndexExpression} from '../../../expressions/methods/strIndex';
import {StrSubExpression} from '../../../expressions/methods/strSub';
import {WindowSizeExpression} from '../../../expressions/methods/windowSize';

import {BaseMethod} from '../../../expressions/methods/_Base';
export interface ExpressionMap extends PolyDictionary<typeof BaseMethod> {
	arg: typeof ArgExpression;
	argc: typeof ArgcExpression;
	bbox: typeof BboxExpression;
	centroid: typeof CentroidExpression;
	ch: typeof ChExpression;
	copy: typeof CopyExpression;
	copRes: typeof CopResExpression;
	isDeviceMobile: typeof isDeviceMobileExpression;
	isDeviceTouch: typeof isDeviceTouchExpression;
	js: typeof JsExpression;
	object: typeof ObjectExpression;
	objectsCount: typeof ObjectsCountExpression;
	opdigits: typeof OpdigitsExpression;
	opname: typeof OpnameExpression;
	padzero: typeof PadzeroExpression;
	point: typeof PointExpression;
	pointsCount: typeof PointsCountExpression;
	strCharsCount: typeof StrCharsCountExpression;
	strConcat: typeof StrConcatExpression;
	strIndex: typeof StrIndexExpression;
	strSub: typeof StrSubExpression;
	windowSize: typeof WindowSizeExpression;
}

import {PolyEngine} from '../../../Poly';
import {PolyDictionary} from '../../../../types/GlobalTypes';
export class AllExpressionsRegister {
	static run(poly: PolyEngine) {
		poly.expressionsRegister.register(ArgExpression, 'arg');
		poly.expressionsRegister.register(ArgcExpression, 'argc');
		poly.expressionsRegister.register(BboxExpression, 'bbox');
		poly.expressionsRegister.register(CentroidExpression, 'centroid');
		poly.expressionsRegister.register(ChExpression, 'ch');
		poly.expressionsRegister.register(CopyExpression, 'copy');
		poly.expressionsRegister.register(CopResExpression, 'copRes');
		poly.expressionsRegister.register(isDeviceMobileExpression, 'isDeviceMobile');
		poly.expressionsRegister.register(isDeviceTouchExpression, 'isDeviceTouch');
		poly.expressionsRegister.register(JsExpression, 'js');
		poly.expressionsRegister.register(ObjectExpression, 'object');
		poly.expressionsRegister.register(ObjectsCountExpression, 'objectsCount');
		poly.expressionsRegister.register(OpdigitsExpression, 'opdigits');
		poly.expressionsRegister.register(OpnameExpression, 'opname');
		poly.expressionsRegister.register(PadzeroExpression, 'padzero');
		poly.expressionsRegister.register(PointExpression, 'point');
		poly.expressionsRegister.register(PointsCountExpression, 'pointsCount');
		poly.expressionsRegister.register(StrCharsCountExpression, 'strCharsCount');
		poly.expressionsRegister.register(StrConcatExpression, 'strConcat');
		poly.expressionsRegister.register(StrIndexExpression, 'strIndex');
		poly.expressionsRegister.register(StrSubExpression, 'strSub');
		poly.expressionsRegister.register(WindowSizeExpression, 'windowSize');
	}
}

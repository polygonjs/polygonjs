/**
 * divides multiple inputs together
 *
 *
 */
// import {JsConnectionPointType} from '../utils/io/connections/Js';
import {MathFunctionArgNOperationFactory} from './_Math_ArgNOperation';

export class DivideJsNode extends MathFunctionArgNOperationFactory('divide', {
	inputPrefix: 'div',
	out: 'division',
	operator: {
		primitive: 'divideNumber',
		// vector: 'multVector',
		vectorScalar: 'divideVectorNumber',
	},
}) {}

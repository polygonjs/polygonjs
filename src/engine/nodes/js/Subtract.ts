/**
 * suvtract multiple inputs from one another
 *
 *
 */
import {MathFunctionArgNOperationFactory} from './_Math_ArgNOperation';

export class SubtractJsNode extends MathFunctionArgNOperationFactory('subtract', {
	inputPrefix: 'sub',
	out: 'sub',
	operator: {
		primitive: 'subtractNumber',
		vector: 'subtractVector',
		vectorScalar: 'subtractVectorNumber',
	},
}) {}

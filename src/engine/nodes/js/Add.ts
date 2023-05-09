/**
 * adds multiple inputs together
 *
 *
 */
import {MathFunctionArgNOperationFactory} from './_Math_ArgNOperation';

export class AddJsNode extends MathFunctionArgNOperationFactory('add', {
	inputPrefix: 'add',
	out: 'sum',
	operator: {
		primitive: 'addNumber',
		vector: 'addVector',
		vectorScalar: 'addVectorNumber',
	},
}) {}

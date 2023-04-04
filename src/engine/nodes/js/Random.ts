/**
 * returns the math function random()
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class RandomJsNode extends MathFunctionArg1OperationFactory('random', {
	inputPrefix: 'trigger',
	out: 'random',
}) {}

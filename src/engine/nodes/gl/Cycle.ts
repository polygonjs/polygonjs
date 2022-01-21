/**
 * cycles a value
 *
 *
 */

import CycleMethods from './gl/cycle.glsl';
import {MathFunctionArg3Factory} from './_Math_Arg3';

export class CycleGlNode extends MathFunctionArg3Factory('cycle', {
	in: ['in', 'min', 'max'],
	default: {max: 1},
	functions: [CycleMethods],
}) {}

import {Euler, Vector3} from 'three';
import {Operation} from '../AnimBuilderTypes';
import {AnimBuilderWithOp} from '../WithOp';

interface PopulateVarsForVector {
	vars: gsap.TweenVars;
	targetValue: Vector3;
	targetProperty: Euler;
	propertyNames: string[];
	operation: Operation;
}
export function populateVarsForEuler(options: PopulateVarsForVector) {
	const {vars, targetValue, targetProperty, propertyNames, operation} = options;
	for (let propertyName of propertyNames) {
		vars[propertyName] = AnimBuilderWithOp(
			targetProperty[propertyName as 'x'],
			targetValue[propertyName as 'x'],
			operation
		);
	}
}

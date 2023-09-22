import {Euler, Vector3} from 'three';
import {GsapTweenVars} from '../../../thirdParty/gsap/gsapFactory';
import {Operation} from '../AnimBuilderTypes';
import {AnimBuilderWithOp} from '../WithOp';

interface PopulateVarsForVector {
	vars: GsapTweenVars;
	targetValue: Vector3;
	targetProperty: Euler;
	propertyNames: string[];
	operation: Operation;
}
export function populateVarsForEuler(options: PopulateVarsForVector) {
	const {vars, targetValue, targetProperty, propertyNames, operation} = options;
	for (const propertyName of propertyNames) {
		vars[propertyName] = AnimBuilderWithOp(
			targetProperty[propertyName as 'x'],
			targetValue[propertyName as 'x'],
			operation
		);
	}
}

import {Vector2, Vector3, Vector4} from 'three';
import {Operation} from '../AnimBuilderTypes';
import {AnimBuilderWithOp} from '../WithOp';

type Vector = Vector2 | Vector3 | Vector4;
interface PopulateVarsForVector {
	vars: gsap.TweenVars;
	targetValue: Vector;
	targetProperty: Vector;
	propertyNames: string[];
	operation: Operation;
}
export function populateVarsForVector(options: PopulateVarsForVector) {
	const {vars, targetValue, targetProperty, propertyNames, operation} = options;
	for (let propertyName of propertyNames) {
		vars[propertyName] = AnimBuilderWithOp(
			targetProperty[propertyName as 'x'],
			targetValue[propertyName as 'x'],
			operation
		);
	}
}

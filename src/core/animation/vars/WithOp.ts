import {TypeAssert} from '../../../engine/poly/Assert';
import {Operation} from './AnimBuilderTypes';

export function AnimBuilderWithOp(currentValue: number, value: number, operation: Operation) {
	switch (operation) {
		case Operation.SET:
			return value;
		case Operation.ADD:
			return currentValue + value;
		case Operation.SUBTRACT:
			return currentValue - value;
	}
	TypeAssert.unreachable(operation);
}

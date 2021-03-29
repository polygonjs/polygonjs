import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CSG} from './utils/Boolean/three-csg';
import {Mesh} from 'three/src/objects/Mesh';
import {TypeAssert} from '../../poly/Assert';

export enum BooleanOperation {
	INTERSECT = 'intersect',
	SUBSTRACT = 'substract',
	UNION = 'union',
}
export const BOOLEAN_OPERATIONS: BooleanOperation[] = [
	BooleanOperation.INTERSECT,
	BooleanOperation.SUBSTRACT,
	BooleanOperation.UNION,
];

interface BooleanSopParams extends DefaultOperationParams {
	operation: number;
}

export class BooleanSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: BooleanSopParams = {
		operation: BOOLEAN_OPERATIONS.indexOf(BooleanOperation.INTERSECT),
	};
	static readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static type(): Readonly<'boolean'> {
		return 'boolean';
	}

	cook(input_contents: CoreGroup[], params: BooleanSopParams): CoreGroup {
		const meshA = input_contents[0].objectsWithGeo()[0] as Mesh;
		const meshB = input_contents[1].objectsWithGeo()[0] as Mesh;

		const result = this._applyBooleaOperation(meshA, meshB, params);
		const meshResult: Mesh = (CSG as any).toMesh(result, meshA.matrix, meshA.material);
		return this.createCoreGroupFromObjects([meshResult]);
	}

	private _applyBooleaOperation(meshA: Mesh, meshB: Mesh, params: BooleanSopParams) {
		const operation = BOOLEAN_OPERATIONS[params.operation];
		let bspA = (CSG as any).fromMesh(meshA);
		let bspB = (CSG as any).fromMesh(meshB);
		switch (operation) {
			case BooleanOperation.INTERSECT: {
				return bspA.intersect(bspB);
			}
			case BooleanOperation.SUBSTRACT: {
				return bspA.subtract(bspB);
			}
			case BooleanOperation.UNION: {
				return bspA.union(bspB);
			}
		}
		TypeAssert.unreachable(operation);
	}
}

import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CSG} from './utils/Boolean/csg';
import {Mesh} from 'three/src/objects/Mesh';
import {TypeAssert} from '../../poly/Assert';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CoreType} from '../../../core/Type';
import {DefaultOperationParams} from '../../../core/operations/_Base';

export enum BooleanOperation {
	INTERSECT = 'intersect',
	SUBTRACT = 'subtract',
	UNION = 'union',
}
export const BOOLEAN_OPERATIONS: BooleanOperation[] = [
	BooleanOperation.INTERSECT,
	BooleanOperation.SUBTRACT,
	BooleanOperation.UNION,
];

interface BooleanSopParams extends DefaultOperationParams {
	operation: number;
	useBothMaterials: boolean;
}

export class BooleanSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BooleanSopParams = {
		operation: BOOLEAN_OPERATIONS.indexOf(BooleanOperation.INTERSECT),
		useBothMaterials: true,
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static override type(): Readonly<'boolean'> {
		return 'boolean';
	}

	override cook(input_contents: CoreGroup[], params: BooleanSopParams): CoreGroup {
		const meshA = input_contents[0].objectsWithGeo()[0] as Mesh;
		const meshB = input_contents[1].objectsWithGeo()[0] as Mesh;

		const result = this._applyBooleaOperation(meshA, meshB, params);

		let matA = meshA.material;

		if (isBooleanTrue(params.useBothMaterials)) {
			matA = CoreType.isArray(matA) ? matA[0] : matA;
			let matB = meshB.material;
			matB = CoreType.isArray(matB) ? matB[0] : matB;
			matA = [matA, matB];
		}
		const meshResult: Mesh = CSG.toMesh(result, meshA.matrix, matA);
		return this.createCoreGroupFromObjects([meshResult]);
	}

	private _applyBooleaOperation(meshA: Mesh, meshB: Mesh, params: BooleanSopParams) {
		const operation = BOOLEAN_OPERATIONS[params.operation];
		let bspA = CSG.fromMesh(meshA, 0);
		let bspB = CSG.fromMesh(meshB, 1);
		switch (operation) {
			case BooleanOperation.INTERSECT: {
				return bspA.intersect(bspB);
			}
			case BooleanOperation.SUBTRACT: {
				return bspA.subtract(bspB);
			}
			case BooleanOperation.UNION: {
				return bspA.union(bspB);
			}
		}
		TypeAssert.unreachable(operation);
	}
}

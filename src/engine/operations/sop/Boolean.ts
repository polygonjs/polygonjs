import {CoreString} from './../../../core/String';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
// import {CSG} from '../../../core/geometry/boolean/three-csg-ts/CSG';
import {Mesh} from 'three';
// import {TypeAssert} from '../../poly/Assert';
// import {isBooleanTrue} from '../../../core/BooleanValue';
// import {CoreType} from '../../../core/Type';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {SUBTRACTION, ADDITION, DIFFERENCE, INTERSECTION, Brush, Evaluator} from './utils/BvhCsg/three-bvh-csg';

export enum BooleanOperation {
	INTERSECT = 'intersect',
	SUBTRACT = 'subtract',
	ADD = 'add',
	DIFFERENCE = 'difference',
}
export const BOOLEAN_OPERATIONS: BooleanOperation[] = [
	BooleanOperation.INTERSECT,
	BooleanOperation.SUBTRACT,
	BooleanOperation.ADD,
	BooleanOperation.DIFFERENCE,
];
const evaluationIdByBooleanOperation: Record<BooleanOperation, number> = {
	[BooleanOperation.INTERSECT]: INTERSECTION,
	[BooleanOperation.SUBTRACT]: SUBTRACTION,
	[BooleanOperation.ADD]: ADDITION,
	[BooleanOperation.DIFFERENCE]: DIFFERENCE,
};

interface BooleanSopParams extends DefaultOperationParams {
	operation: number;
	keepVertexColor: boolean;
	additionalAttributes: string;
	keepMaterials: boolean;
	useInputGroups: boolean;
}

export class BooleanSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BooleanSopParams = {
		operation: BOOLEAN_OPERATIONS.indexOf(BooleanOperation.INTERSECT),
		keepVertexColor: false,
		additionalAttributes: '',
		keepMaterials: true,
		useInputGroups: false,
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static override type(): Readonly<'boolean'> {
		return 'boolean';
	}

	override cook(inputCoreGroups: CoreGroup[], params: BooleanSopParams): CoreGroup {
		const meshA = inputCoreGroups[0].objectsWithGeo()[0] as Mesh | undefined;
		const meshB = inputCoreGroups[1].objectsWithGeo()[0] as Mesh | undefined;
		if (!(meshA && meshA.geometry && meshB && meshB.geometry)) {
			this.states?.error.set('input objects need to have mesh geometries at the top level');
			return this.createCoreGroupFromObjects([]);
		}

		const csgEvaluator = new Evaluator();
		const brush1 = new Brush(meshA.geometry, params.keepMaterials ? meshA.material : undefined);
		const brush2 = new Brush(meshB.geometry, params.keepMaterials ? meshB.material : undefined);

		const operation = BOOLEAN_OPERATIONS[params.operation];
		const operationId = evaluationIdByBooleanOperation[operation];

		const attributes = ['position', 'normal'];
		if (params.keepVertexColor) {
			attributes.push('color');
		}
		if (params.additionalAttributes.trim() != '') {
			const newNames = CoreString.attribNames(params.additionalAttributes);
			attributes.push(...newNames);
		}
		csgEvaluator.attributes = attributes;
		// csgEvaluator.debug.enabled = true;
		csgEvaluator.useGroups = params.keepMaterials || params.useInputGroups;
		// we currently need to use the returned object from .evaluate in order to
		// have a new object with a correct bounding box
		const output = csgEvaluator.evaluate(brush1, brush2, operationId);

		// brush1.geometry.computeBoundingBox();

		if (!params.keepMaterials) {
			output.material = meshA.material;
		}
		// console.log(result);

		// const result = this._applyBooleaOperation(meshA, meshB, params);

		// let matA = meshA.material;

		// if (isBooleanTrue(params.useBothMaterials)) {
		// 	matA = CoreType.isArray(matA) ? matA[0] : matA;
		// 	let matB = meshB.material;
		// 	matB = CoreType.isArray(matB) ? matB[0] : matB;
		// 	matA = [matA, matB];
		// }
		// const meshResult: Mesh = CSG.toMesh(result, meshA.matrix, matA);
		return this.createCoreGroupFromObjects([output]);
	}

	// private _applyBooleaOperation(meshA: Mesh, meshB: Mesh, params: BooleanSopParams) {
	// 	const operation = BOOLEAN_OPERATIONS[params.operation];
	// 	let bspA = CSG.fromMesh(meshA, 0);
	// 	let bspB = CSG.fromMesh(meshB, 1);
	// 	switch (operation) {
	// 		case BooleanOperation.INTERSECT: {
	// 			return bspA.intersect(bspB);
	// 		}
	// 		case BooleanOperation.SUBTRACT: {
	// 			return bspA.subtract(bspB);
	// 		}
	// 		case BooleanOperation.UNION: {
	// 			return bspA.union(bspB);
	// 		}
	// 	}
	// 	TypeAssert.unreachable(operation);
	// }
}

import {stringToAttribNames} from './../../../core/String';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Mesh, Line3, BufferGeometry, Float32BufferAttribute} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {
	SUBTRACTION,
	ADDITION,
	DIFFERENCE,
	INTERSECTION,
	Brush,
	Evaluator,
} from '../../../core/thirdParty/three-bvh-csg';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreGeometryBuilderMerge} from '../../../core/geometry/builders/Merge';

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
	//
	keepVertexColor: boolean;
	additionalAttributes: string;
	//
	keepMaterials: boolean;
	useInputGroups: boolean;
	intersectionEdgesOnly: boolean;
}

export class BooleanSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BooleanSopParams = {
		operation: BOOLEAN_OPERATIONS.indexOf(BooleanOperation.INTERSECT),
		keepVertexColor: false,
		additionalAttributes: '',
		keepMaterials: true,
		useInputGroups: false,
		intersectionEdgesOnly: false,
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static override type(): Readonly<'boolean'> {
		return 'boolean';
	}

	override cook(inputCoreGroups: CoreGroup[], params: BooleanSopParams): CoreGroup {
		const meshA = inputCoreGroups[0].threejsObjectsWithGeo()[0] as Mesh | undefined;
		const meshB = inputCoreGroups[1].threejsObjectsWithGeo()[0] as Mesh | undefined;
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
			const newNames = stringToAttribNames(params.additionalAttributes);
			attributes.push(...newNames);
		}
		csgEvaluator.attributes = attributes;
		csgEvaluator.useGroups = params.keepMaterials || params.useInputGroups;
		// we currently need to use the returned object from .evaluate in order to
		// have a new object with a correct bounding box
		(csgEvaluator.debug as any).enabled = params.intersectionEdgesOnly;
		const output = csgEvaluator.evaluate(brush1, brush2, operationId);

		if (params.intersectionEdgesOnly) {
			const lines = csgEvaluator.debug.intersectionEdges as any as Line3[];
			if (lines.length > 0) {
				const linesGeometry = _createLinesObject(lines);
				if (linesGeometry) {
					const object = BaseSopOperation.createObject(linesGeometry, ObjectType.LINE_SEGMENTS);
					return this.createCoreGroupFromObjects([object]);
				}
			}
		} else {
			output.disposeCacheData();
			BaseSopOperation.createIndexIfNone(output.geometry);
			// brush1.geometry.computeBoundingBox();

			if (!params.keepMaterials) {
				output.material = meshA.material;
			}

			return this.createCoreGroupFromObjects([output]);
		}
		return this.createCoreGroupFromObjects([]);
	}
}

function _createLinesObject(lines: Line3[]): BufferGeometry | undefined {
	const geometries = lines.map(_createLineGeometry);
	return CoreGeometryBuilderMerge.merge(geometries);
}

function _createLineGeometry(line: Line3): BufferGeometry {
	const pointsCount = 2;

	const positions: number[] = new Array(pointsCount * 3);
	const indices: number[] = new Array(pointsCount);

	const i = 0;
	line.start.toArray(positions, i * 3);
	line.end.toArray(positions, (i + 1) * 3);

	indices[0] = 0;
	indices[1] = 1;
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	geometry.setIndex(indices);
	return geometry;
}

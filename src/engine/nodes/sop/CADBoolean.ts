/**
 * Applies a boolean operation
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {
	OpenCascadeInstance,
	TopoDS_Shape,
	CadGeometryTypeShape,
	cadGeometryTypeFromShape,
} from '../../../core/geometry/cad/CadCommon';
import {CadGeometryType} from '../../../core/geometry/cad/CadCommon';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {TypeAssert} from '../../poly/Assert';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';

enum BooleanMode {
	ALL_IN_SEQUENCE = 'process all in sequence',
	ONE_TO_ONE = 'one to one',
	ONE_TO_MANY = 'one to many',
}
const BOOLEAN_MODES: BooleanMode[] = [BooleanMode.ALL_IN_SEQUENCE, BooleanMode.ONE_TO_ONE, BooleanMode.ONE_TO_MANY];

export enum BooleanCadOperationType {
	INTERSECT = 'intersect',
	SECTION = 'section',
	SUBTRACT = 'subtract',
	UNION = 'union',
}
export const BOOLEAN_CAD_OPERATION_TYPES: BooleanCadOperationType[] = [
	BooleanCadOperationType.INTERSECT,
	BooleanCadOperationType.SUBTRACT,
	BooleanCadOperationType.UNION,
	BooleanCadOperationType.SECTION,
];

class CADBooleanSopParamsConfig extends NodeParamsConfig {
	/** @param operation */
	operation = ParamConfig.INTEGER(BOOLEAN_CAD_OPERATION_TYPES.indexOf(BooleanCadOperationType.INTERSECT), {
		menu: {entries: BOOLEAN_CAD_OPERATION_TYPES.map((name, value) => ({name, value}))},
	});
	/** @param mode */
	mode = ParamConfig.INTEGER(BOOLEAN_MODES.indexOf(BooleanMode.ONE_TO_MANY), {
		menu: {
			entries: BOOLEAN_MODES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new CADBooleanSopParamsConfig();

export class CADBooleanSopNode extends CADSopNode<CADBooleanSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_BOOLEAN;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1, 2);
	}
	setOperation(operation: BooleanCadOperationType) {
		this.p.operation.set(BOOLEAN_CAD_OPERATION_TYPES.indexOf(operation));
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const oc = CadLoaderSync.oc();

		const operation = BOOLEAN_CAD_OPERATION_TYPES[this.pv.operation];

		const mode = BOOLEAN_MODES[this.pv.mode];
		switch (mode) {
			case BooleanMode.ALL_IN_SEQUENCE: {
				return this._createBooleansAllInSequence(oc, operation, inputCoreGroups);
			}
			case BooleanMode.ONE_TO_ONE: {
				return this._createBooleansOneToOne(oc, operation, inputCoreGroups);
			}
			case BooleanMode.ONE_TO_MANY: {
				return this._createBooleansOneToMany(oc, operation, inputCoreGroups);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _createBooleansAllInSequence(
		oc: OpenCascadeInstance,
		operation: BooleanCadOperationType,
		inputCoreGroups: CoreGroup[]
	) {
		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputCoreGroup0 = inputCoreGroups[0];
		const inputCoreGroup1 = inputCoreGroups[1];
		let shapeObjects0 = inputCoreGroup0.cadObjectsWithShape();
		if (shapeObjects0) {
			if (inputCoreGroup1) {
				const shapeObjects1 = inputCoreGroup1.cadObjectsWithShape();
				if (shapeObjects1) {
					shapeObjects0 = shapeObjects0.concat(shapeObjects1);
				}
			}
			// TODO: shapes with same types should be processed together?
			// Or maybe not if dealing with curves and surfaces
			_createBooleansAllInSequence(oc, operation, shapeObjects0, newObjects);
		}
		this.setCADObjects(newObjects);
	}
	private _createBooleansOneToOne(
		oc: OpenCascadeInstance,
		operation: BooleanCadOperationType,
		inputCoreGroups: CoreGroup[]
	) {
		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputCoreGroup0 = inputCoreGroups[0];
		const inputCoreGroup1 = inputCoreGroups[1];

		if (!inputCoreGroup1) {
			this.states.error.set('input 1 required for this mode');
			return;
		}
		const shapeObjects0 = inputCoreGroup0.cadObjectsWithShape();
		const shapeObjects1 = inputCoreGroup1.cadObjectsWithShape();

		if (shapeObjects0 && shapeObjects1) {
			_createBooleansOneToOne(oc, operation, shapeObjects0, shapeObjects1, newObjects);
		}
		this.setCADObjects(newObjects);
	}
	private _createBooleansOneToMany(
		oc: OpenCascadeInstance,
		operation: BooleanCadOperationType,
		inputCoreGroups: CoreGroup[]
	) {
		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputCoreGroup0 = inputCoreGroups[0];
		const inputCoreGroup1 = inputCoreGroups[1];
		if (!inputCoreGroup1) {
			this.states.error.set('input 1 required for this mode');
			return;
		}
		const shapeObjects0 = inputCoreGroup0.cadObjectsWithShape();
		const shapeObjects1 = inputCoreGroup1.cadObjectsWithShape();
		if (shapeObjects0 && shapeObjects1) {
			_createBooleansOneToMany(oc, operation, shapeObjects0, shapeObjects1, newObjects);
		}

		this.setCADObjects(newObjects);
	}

	// override async cook(inputCoreGroups: CadCoreGroup[]) {
	// 	const oc = await CadLoader.core();
	// 	const coreGroup0 = inputCoreGroups[0];
	// 	const coreGroup1 = inputCoreGroups[1];

	// 	const object0 = coreGroup0.objects()[0];
	// 	const object1 = coreGroup1.objects()[0];

	// 	const operation = BOOLEAN_CAD_OPERATION_TYPES[this.pv.operation];
	// 	const apiClass = {
	// 		[BooleanCadOperationType.INTERSECT]: oc.BRepAlgoAPI_Common_3,
	// 		[BooleanCadOperationType.SUBTRACT]: oc.BRepAlgoAPI_Cut_3,
	// 		[BooleanCadOperationType.UNION]: oc.BRepAlgoAPI_Fuse_3,
	// 		[BooleanCadOperationType.SECTION]: oc.BRepAlgoAPI_Section_3,
	// 	}[operation];

	// 	if (object0 && object1 && CoreCadType.isShape(object0) && CoreCadType.isShape(object1)) {
	// 		const cut = new apiClass(object0.object(), object1.object(), new oc.Message_ProgressRange_1());
	// 		cut.Build(new oc.Message_ProgressRange_1());

	// 		const shape = cut.Shape();
	// 		this.setShell(shape);
	// 	} else {
	// 		this.setCadObjects([object0]);
	// 	}
	// }
}
function _createBooleansAllInSequence(
	oc: OpenCascadeInstance,
	operation: BooleanCadOperationType,
	shapeObjects: CadObject<CadGeometryTypeShape>[],
	newObjects: CadObject<CadGeometryType>[]
) {
	let previousShape: TopoDS_Shape | undefined;
	for (let shapeObject of shapeObjects) {
		if (previousShape) {
			const newShape = _booleanOperation(oc, operation, previousShape, shapeObject.cadGeometry());
			previousShape = newShape;
		} else {
			previousShape = shapeObject.cadGeometry();
		}
	}
	if (previousShape) {
		const type = cadGeometryTypeFromShape(oc, previousShape);
		if (type) {
			newObjects.push(new CadObject(previousShape, type));
		} else {
			console.log('no type', previousShape);
		}
	}
}
function _createBooleansOneToOne(
	oc: OpenCascadeInstance,
	operation: BooleanCadOperationType,
	shapeObjects0: CadObject<CadGeometryTypeShape>[],
	shapeObjects1: CadObject<CadGeometryTypeShape>[],
	newObjects: CadObject<CadGeometryType>[]
) {
	const minVerticesCount = Math.min(shapeObjects0.length, shapeObjects1.length);
	for (let i = 0; i < minVerticesCount; i++) {
		const shape0 = shapeObjects0[i].cadGeometry();
		const shape1 = shapeObjects1[i].cadGeometry();
		const newShape = _booleanOperation(oc, operation, shape0, shape1);
		const type = cadGeometryTypeFromShape(oc, newShape);
		if (type) {
			newObjects.push(new CadObject(newShape, type));
		} else {
			console.log('no type', newShape);
		}
	}
}
function _createBooleansOneToMany(
	oc: OpenCascadeInstance,
	operation: BooleanCadOperationType,
	shapeObjects0: CadObject<CadGeometryTypeShape>[],
	shapeObjects1: CadObject<CadGeometryTypeShape>[],
	newObjects: CadObject<CadGeometryType>[]
) {
	for (let shapeObject0 of shapeObjects0) {
		let previousBooleanShapeResult: TopoDS_Shape = shapeObject0.cadGeometry();
		for (let shapeObject1 of shapeObjects1) {
			previousBooleanShapeResult = _booleanOperation(
				oc,
				operation,
				previousBooleanShapeResult,
				shapeObject1.cadGeometry()
			);
		}
		if (previousBooleanShapeResult) {
			const type = cadGeometryTypeFromShape(oc, previousBooleanShapeResult);
			if (type) {
				newObjects.push(new CadObject(previousBooleanShapeResult, type));
			} else {
				console.log('no type', previousBooleanShapeResult);
			}
		}
		// return previousBooleanShapeResult;
	}
}

function _booleanOperation(
	oc: OpenCascadeInstance,
	operation: BooleanCadOperationType,
	shape0: TopoDS_Shape,
	shape1: TopoDS_Shape
) {
	switch (operation) {
		case BooleanCadOperationType.INTERSECT: {
			return _booleanOperationIntersect(oc, shape0, shape1);
		}
		case BooleanCadOperationType.SUBTRACT: {
			return _booleanOperationSubtract(oc, shape0, shape1);
		}
		case BooleanCadOperationType.UNION: {
			return _booleanOperationUnion(oc, shape0, shape1);
		}
		case BooleanCadOperationType.SECTION: {
			return _booleanOperationSection(oc, shape0, shape1);
		}
	}
	TypeAssert.unreachable(operation);
}

function _booleanOperationIntersect(oc: OpenCascadeInstance, shape0: TopoDS_Shape, shape1: TopoDS_Shape) {
	const operation = new oc.BRepAlgoAPI_Common_3(shape0, shape1, CadLoaderSync.Message_ProgressRange);
	operation.Build(CadLoaderSync.Message_ProgressRange);

	const shape = operation.Shape();
	operation.delete();
	return shape;
}
function _booleanOperationSubtract(oc: OpenCascadeInstance, shape0: TopoDS_Shape, shape1: TopoDS_Shape) {
	const operation = new oc.BRepAlgoAPI_Cut_3(shape0, shape1, CadLoaderSync.Message_ProgressRange);
	operation.Build(CadLoaderSync.Message_ProgressRange);

	const shape = operation.Shape();
	operation.delete();
	return shape;
}
function _booleanOperationUnion(oc: OpenCascadeInstance, shape0: TopoDS_Shape, shape1: TopoDS_Shape) {
	const operation = new oc.BRepAlgoAPI_Fuse_3(shape0, shape1, CadLoaderSync.Message_ProgressRange);
	operation.Build(CadLoaderSync.Message_ProgressRange);

	const shape = operation.Shape();
	operation.delete();
	return shape;
}
function _booleanOperationSection(oc: OpenCascadeInstance, shape0: TopoDS_Shape, shape1: TopoDS_Shape) {
	const operation = new oc.BRepAlgoAPI_Section_3(shape0, shape1, true);
	// cut.Build(CadLoaderSync.Message_ProgressRange);

	const shape = operation.Shape();
	operation.delete();
	return shape;
}

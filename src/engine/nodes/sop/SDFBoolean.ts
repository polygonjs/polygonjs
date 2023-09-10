// /**
//  * Applies an SDF boolean operation.
//  *
//  *
//  */

// import {SDFSopNode} from './_BaseSDF';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {SDFObject} from '../../../core/geometry/modules/sdf/SDFObject';
// import {TypeAssert} from '../../poly/Assert';
// import {SDFLoaderSync} from '../../../core/geometry/modules/sdf/SDFLoaderSync';
// import {ManifoldStatic, SDFGeometry} from '../../../core/geometry/modules/sdf/SDFCommon';

// enum BooleanMode {
// 	ALL_IN_SEQUENCE = 'process all in sequence',
// 	ONE_TO_ONE = 'one to one',
// 	ONE_TO_MANY = 'one to many',
// }
// const BOOLEAN_MODES: BooleanMode[] = [BooleanMode.ALL_IN_SEQUENCE, BooleanMode.ONE_TO_ONE, BooleanMode.ONE_TO_MANY];
// export enum BooleanSDFOperationType {
// 	INTERSECT = 'intersect',
// 	SUBTRACT = 'subtract',
// 	UNION = 'union',
// }
// export const BOOLEAN_SDF_OPERATION_TYPES: BooleanSDFOperationType[] = [
// 	BooleanSDFOperationType.INTERSECT,
// 	BooleanSDFOperationType.SUBTRACT,
// 	BooleanSDFOperationType.UNION,
// ];

// class SDFBooleanSopParamsConfig extends NodeParamsConfig {
// 	/** @param operation */
// 	operation = ParamConfig.INTEGER(BOOLEAN_SDF_OPERATION_TYPES.indexOf(BooleanSDFOperationType.INTERSECT), {
// 		menu: {entries: BOOLEAN_SDF_OPERATION_TYPES.map((name, value) => ({name, value}))},
// 	});
// 	/** @param mode */
// 	mode = ParamConfig.INTEGER(BOOLEAN_MODES.indexOf(BooleanMode.ONE_TO_MANY), {
// 		menu: {
// 			entries: BOOLEAN_MODES.map((name, value) => ({name, value})),
// 		},
// 	});
// }
// const ParamsConfig = new SDFBooleanSopParamsConfig();

// export class SDFBooleanSopNode extends SDFSopNode<SDFBooleanSopParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return SopType.SDF_BOOLEAN;
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(2);
// 	}
// 	setOperation(operation: BooleanSDFOperationType) {
// 		this.p.operation.set(BOOLEAN_SDF_OPERATION_TYPES.indexOf(operation));
// 	}

// 	override async cook(inputCoreGroups: CoreGroup[]) {
// 		const manifold = SDFLoaderSync.manifold();
// 		const operation = BOOLEAN_SDF_OPERATION_TYPES[this.pv.operation];

// 		const mode = BOOLEAN_MODES[this.pv.mode];
// 		switch (mode) {
// 			case BooleanMode.ALL_IN_SEQUENCE: {
// 				return this._createBooleansAllInSequence(manifold, operation, inputCoreGroups);
// 			}
// 			case BooleanMode.ONE_TO_ONE: {
// 				return this._createBooleansOneToOne(manifold, operation, inputCoreGroups);
// 			}
// 			case BooleanMode.ONE_TO_MANY: {
// 				return this._createBooleansOneToMany(manifold, operation, inputCoreGroups);
// 			}
// 		}
// 		TypeAssert.unreachable(mode);
// 	}
// 	private _createBooleansAllInSequence(
// 		manifold: ManifoldStatic,
// 		operation: BooleanSDFOperationType,
// 		inputCoreGroups: CoreGroup[]
// 	) {
// 		const newObjects: SDFObject[] = [];
// 		const inputCoreGroup0 = inputCoreGroups[0];
// 		const inputCoreGroup1 = inputCoreGroups[1];
// 		let objects0 = inputCoreGroup0.SDFObjects();
// 		if (objects0) {
// 			if (inputCoreGroup1) {
// 				const objects1 = inputCoreGroup1.SDFObjects();
// 				if (objects1) {
// 					objects0 = objects0.concat(objects1);
// 				}
// 			}
// 			_createBooleansAllInSequence(manifold, operation, objects0, newObjects);
// 		}
// 		this.setSDFObjects(newObjects);
// 	}
// 	private _createBooleansOneToOne(
// 		manifold: ManifoldStatic,
// 		operation: BooleanSDFOperationType,
// 		inputCoreGroups: CoreGroup[]
// 	) {
// 		const newObjects: SDFObject[] = [];
// 		const inputCoreGroup0 = inputCoreGroups[0];
// 		const inputCoreGroup1 = inputCoreGroups[1];

// 		if (!inputCoreGroup1) {
// 			this.states.error.set('input 1 required for this mode');
// 			return;
// 		}
// 		const objects0 = inputCoreGroup0.SDFObjects();
// 		const objects1 = inputCoreGroup1.SDFObjects();

// 		if (objects0 && objects1) {
// 			_createBooleansOneToOne(manifold, operation, objects0, objects1, newObjects);
// 		}
// 		this.setSDFObjects(newObjects);
// 	}
// 	private _createBooleansOneToMany(
// 		manifold: ManifoldStatic,
// 		operation: BooleanSDFOperationType,
// 		inputCoreGroups: CoreGroup[]
// 	) {
// 		const newObjects: SDFObject[] = [];
// 		const inputCoreGroup0 = inputCoreGroups[0];
// 		const inputCoreGroup1 = inputCoreGroups[1];
// 		if (!inputCoreGroup1) {
// 			this.states.error.set('input 1 required for this mode');
// 			return;
// 		}
// 		const objects0 = inputCoreGroup0.SDFObjects();
// 		const objects1 = inputCoreGroup1.SDFObjects();
// 		if (objects0 && objects1) {
// 			_createBooleansOneToMany(manifold, operation, objects0, objects1, newObjects);
// 		}

// 		this.setSDFObjects(newObjects);
// 	}
// }

// function _createBooleansAllInSequence(
// 	manifold: ManifoldStatic,
// 	operation: BooleanSDFOperationType,
// 	objects: SDFObject[],
// 	newObjects: SDFObject[]
// ) {
// 	let previousGeometry: SDFGeometry | undefined;
// 	for (let object of objects) {
// 		if (previousGeometry) {
// 			const newGeometry = _booleanOperation(manifold, operation, previousGeometry, object.SDFGeometry());
// 			previousGeometry = newGeometry;
// 		} else {
// 			previousGeometry = object.SDFGeometry();
// 		}
// 	}
// 	if (previousGeometry) {
// 		newObjects.push(new SDFObject(previousGeometry));
// 	}
// }
// function _createBooleansOneToOne(
// 	manifold: ManifoldStatic,
// 	operation: BooleanSDFOperationType,
// 	objects0: SDFObject[],
// 	objects1: SDFObject[],
// 	newObjects: SDFObject[]
// ) {
// 	const minobjectsCount = Math.min(objects0.length, objects1.length);
// 	for (let i = 0; i < minobjectsCount; i++) {
// 		const shape0 = objects0[i].SDFGeometry();
// 		const shape1 = objects1[i].SDFGeometry();
// 		const newGeometry = _booleanOperation(manifold, operation, shape0, shape1);
// 		if (newGeometry) {
// 			newObjects.push(new SDFObject(newGeometry));
// 		}
// 	}
// }
// function _createBooleansOneToMany(
// 	manifold: ManifoldStatic,
// 	operation: BooleanSDFOperationType,
// 	objects0: SDFObject[],
// 	objects1: SDFObject[],
// 	newObjects: SDFObject[]
// ) {
// 	for (let object0 of objects0) {
// 		let previousBooleanResult: SDFGeometry = object0.SDFGeometry();
// 		for (let object1 of objects1) {
// 			previousBooleanResult = _booleanOperation(
// 				manifold,
// 				operation,
// 				previousBooleanResult,
// 				object1.SDFGeometry()
// 			);
// 		}
// 		if (previousBooleanResult) {
// 			newObjects.push(new SDFObject(previousBooleanResult));
// 		}
// 	}
// }

// function _booleanOperation(
// 	manifold: ManifoldStatic,
// 	operation: BooleanSDFOperationType,
// 	geometry0: SDFGeometry,
// 	geometry1: SDFGeometry
// ) {
// 	switch (operation) {
// 		case BooleanSDFOperationType.INTERSECT: {
// 			return _booleanOperationIntersect(manifold, geometry0, geometry1);
// 		}
// 		case BooleanSDFOperationType.SUBTRACT: {
// 			return _booleanOperationSubtract(manifold, geometry0, geometry1);
// 		}
// 		case BooleanSDFOperationType.UNION: {
// 			return _booleanOperationUnion(manifold, geometry0, geometry1);
// 		}
// 	}
// 	TypeAssert.unreachable(operation);
// }

// function _booleanOperationIntersect(manifold: ManifoldStatic, geometry0: SDFGeometry, geometry1: SDFGeometry) {
// 	return manifold.intersection(geometry0, geometry1);
// }
// function _booleanOperationSubtract(manifold: ManifoldStatic, geometry0: SDFGeometry, geometry1: SDFGeometry) {
// 	return manifold.difference(geometry0, geometry1);
// }
// function _booleanOperationUnion(manifold: ManifoldStatic, geometry0: SDFGeometry, geometry1: SDFGeometry) {
// 	return manifold.union(geometry0, geometry1);
// }

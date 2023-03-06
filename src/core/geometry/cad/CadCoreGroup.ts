// import {Poly} from '../../../engine/Poly';
// import {CadCoreObject} from './CadCoreObject';
// import {CadGeometryType, CadGeometryTypeShape, TesselationParams} from './CadCommon';
// import {CadLoader} from './CadLoader';
// import {Object3D} from 'three';
// import {CoreCadType} from './CadCoreType';
// import {CoreType} from '../../Type';

// export class CadCoreGroup {
// 	private _timestamp: number | undefined;
// 	private _objects: CadCoreObject<CadGeometryType>[] = [];

// 	constructor() {
// 		this.touch();
// 	}
// 	dispose() {
// 		this._objects = [];
// 	}

// 	//
// 	//
// 	// TIMESTAMP
// 	//
// 	//
// 	timestamp() {
// 		return this._timestamp;
// 	}
// 	touch() {
// 		const performance = Poly.performance.performanceManager();
// 		this._timestamp = performance.now();
// 		// this.reset();
// 	}

// 	//
// 	//
// 	// CLONE
// 	//
// 	//
// 	clone() {
// 		const csgCoreGroup = new CadCoreGroup();
// 		if (this._objects) {
// 			const objects: CadCoreObject<CadObjectType>[] = [];
// 			for (let object of this._objects) {
// 				objects.push(CadCoreObject.clone(object));
// 			}
// 			csgCoreGroup.setObjects(objects);
// 		}
// 		return csgCoreGroup;
// 	}
// 	//
// 	//
// 	// OBJECTS
// 	//
// 	//
// 	setObjects(objects: CadCoreObject<CadObjectType>[]) {
// 		this._objects = objects;
// 		this.touch();
// 	}
// 	objects() {
// 		return this._objects;
// 	}
// 	objectsWithType<T extends CadObjectType>(type: T) {
// 		return this._objects.filter((o) => o.type() == type) as CadCoreObject<T>[];
// 	}
// 	objectsWithShape() {
// 		return this._objects.filter((o) => CoreCadType.isShape(o)) as CadCoreObject<CadObjectTypeShape>[];
// 	}

// 	// async toObject3Ds(tesselationParams: TesselationParams) {
// 	// 	const oc = await CadLoader.core();
// 	// 	const objects3D: Object3D[] = [];
// 	// 	for (let obj of this._objects) {
// 	// 		const object3D = obj.toObject3D(oc, tesselationParams);
// 	// 		if (object3D) {
// 	// 			if (CoreType.isArray(object3D)) {
// 	// 				objects3D.push(...object3D);
// 	// 			} else {
// 	// 				objects3D.push(object3D);
// 	// 			}
// 	// 		}
// 	// 	}
// 	// 	return objects3D;
// 	// }
// }

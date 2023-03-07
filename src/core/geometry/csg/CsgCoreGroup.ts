// import {Poly} from '../../../engine/Poly';
// import {CsgCoreObject, CsgObject} from './CsgCoreObject';

// export class CsgCoreGroup {
// 	// _group: Group
// 	private _timestamp: number | undefined;
// 	// _core_objects:
// 	private _objects: CsgObject[] = [];

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
// 		const csgCoreGroup = new CsgCoreGroup();
// 		if (this._objects) {
// 			const objects = [];
// 			for (let object of this._objects) {
// 				objects.push(CsgCoreObject.clone(object));
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
// 	setObjects(objects: CsgObject[]) {
// 		this._objects = objects;
// 		this.touch();
// 	}
// 	objects() {
// 		return this._objects;
// 	}
// 	points() {
// 		return this._objects.map((o) => CsgCoreObject.points(o)).flat();
// 	}
// }

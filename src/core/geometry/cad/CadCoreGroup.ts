import {Poly} from '../../../engine/Poly';
import {CadCoreObject} from './CadCoreObject';
import {CadObjectType, TesselationParams} from './CadCommon';
import {CadLoader} from './CadLoader';
import {Object3D} from 'three';

export class CadCoreGroup {
	private _timestamp: number | undefined;
	private _objects: CadCoreObject<CadObjectType>[] = [];

	constructor() {
		this.touch();
	}
	dispose() {
		this._objects = [];
	}

	//
	//
	// TIMESTAMP
	//
	//
	timestamp() {
		return this._timestamp;
	}
	touch() {
		const performance = Poly.performance.performanceManager();
		this._timestamp = performance.now();
		// this.reset();
	}

	//
	//
	// CLONE
	//
	//
	clone() {
		const csgCoreGroup = new CadCoreGroup();
		if (this._objects) {
			const objects: CadCoreObject<CadObjectType>[] = [];
			for (let object of this._objects) {
				objects.push(CadCoreObject.clone(object));
			}
			csgCoreGroup.setObjects(objects);
		}
		return csgCoreGroup;
	}
	//
	//
	// OBJECTS
	//
	//
	setObjects(objects: CadCoreObject<CadObjectType>[]) {
		this._objects = objects;
		this.touch();
	}
	objects() {
		return this._objects;
	}

	async toObject3Ds(tesselationParams: TesselationParams) {
		const oc = await CadLoader.core();
		const objects3D: Object3D[] = [];
		for (let obj of this._objects) {
			const object3D = obj.toObject3D(oc, tesselationParams);
			if (object3D) {
				objects3D.push(object3D);
			}
		}
		return objects3D;
	}
}

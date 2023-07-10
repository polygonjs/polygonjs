import {Object3D, Material, Matrix4, Box3, Sphere} from 'three';
import {ObjectContent, CoreObjectType, ObjectGeometryMap, objectContentCopyProperties} from '../ObjectContent';
import {CoreType} from '../../Type';
import {TetGeometry} from './TetGeometry';
import {TetTesselationParams} from './TetCommon';
import {tetToOuterMesh} from './toObject3D/tetToOuterMesh';
import {tetToTetMesh} from './toObject3D/tetToTetMesh';
import {tetToLines} from './toObject3D/tetToLines';
import {tetSharedFacesToLines} from './toObject3D/tetToSharedFacesToLine';
import {tetToPoints} from './toObject3D/tetToPoints';
import {tetToCenter} from './toObject3D/tetToCenter';
import {tetToSphere} from './toObject3D/tetToSphere';

export class TetObject implements ObjectContent<CoreObjectType.TET> {
	public visible = true;
	get geometry() {
		return this._geometry as ObjectGeometryMap[CoreObjectType.TET];
	}
	get type() {
		return CoreObjectType.TET;
	}
	parent = null;
	children = [];
	userData = {};
	name = '';
	castShadow = true;
	receiveShadow = true;
	renderOrder = 0;
	frustumCulled = true;
	matrixAutoUpdate = false;
	material: Material | undefined;
	constructor(private _geometry: TetGeometry) {}

	setGeometry(geometry: TetGeometry) {
		this._geometry = geometry;
	}
	tetGeometry() {
		return this.geometry! as TetGeometry;
	}
	dispose() {}
	applyMatrix4(matrix: Matrix4) {
		this.geometry.applyMatrix4(matrix);
	}
	remove(...object: ObjectContent<CoreObjectType>[]) {}
	traverse(callback: (object: TetObject) => any) {
		callback(this);
	}

	clone(): TetObject {
		const geometry = this._geometry.clone();
		const clone = new TetObject(geometry);

		objectContentCopyProperties(this, clone);
		return clone;
	}
	toObject3D(tesselationParams: TetTesselationParams): Object3D | Object3D[] | undefined {
		const object = TetObject.toObject3D(this, tesselationParams);
		if (object) {
			if (CoreType.isArray(object)) {
				for (let element of object) {
					objectContentCopyProperties(this, element);
				}
			} else {
				objectContentCopyProperties(this, object);
			}
		}
		return object;
	}

	static toObject3D(
		tetObject: TetObject,
		tesselationParams: TetTesselationParams
	): Object3D | Object3D[] | undefined {
		const objects: Object3D[] = [];
		if (tesselationParams.displayOuterMesh) {
			objects.push(tetToOuterMesh(tetObject.tetGeometry(), tesselationParams));
		}
		if (tesselationParams.displayTetMesh) {
			objects.push(tetToTetMesh(tetObject.tetGeometry(), tesselationParams));
		}
		if (tesselationParams.displayLines) {
			objects.push(tetToLines(tetObject.tetGeometry(), tesselationParams));
		}
		if (tesselationParams.displaySharedFaces) {
			objects.push(tetSharedFacesToLines(tetObject.tetGeometry(), tesselationParams));
		}
		if (tesselationParams.displayPoints) {
			objects.push(tetToPoints(tetObject.tetGeometry(), tesselationParams));
		}
		if (tesselationParams.displayCenter) {
			objects.push(tetToCenter(tetObject.tetGeometry(), tesselationParams));
		}
		if (tesselationParams.displaySphere) {
			const spheres = tetToSphere(tetObject.tetGeometry(), tesselationParams);
			if (spheres) {
				objects.push(spheres);
			}
		}
		return objects;
	}

	boundingBox(target: Box3): void {
		this.geometry.boundingBox(target);
	}
	boundingSphere(target: Sphere): void {
		this.geometry.boundingSphere(target);
	}
}

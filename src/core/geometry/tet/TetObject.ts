import {Object3D, Material, Matrix4, Box3, Sphere} from 'three';
import {ObjectContent, CoreObjectType, ObjectGeometryMap, objectContentCopyProperties} from '../ObjectContent';
import {CoreType} from '../../Type';
import {TetGeometry} from './TetGeometry';
import {TetTesselationParams} from './TetCommon';
import {tetToMesh} from './toObject3D/tetToMesh';
import {tetToLines} from './toObject3D/tetToLines';
import {tetSharedFacesToLines} from './toObject3D/tetToSharedFacesToLine';
import {tetToCenter} from './toObject3D/tetToCenter';

export class TetObject implements ObjectContent<CoreObjectType.TET> {
	public visible = true;
	get geometry() {
		return this._geometry as ObjectGeometryMap[CoreObjectType.TET];
	}
	get type() {
		return CoreObjectType.TET;
	}
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
		console.warn('applyMatrix4 not implemented');
		// matrix4ToMat4(matrix, this.tetGeometry().transforms);
	}
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
		if (tesselationParams.displayMesh) {
			objects.push(tetToMesh(tetObject.tetGeometry(), tesselationParams));
		}
		if (tesselationParams.displayLines) {
			objects.push(tetToLines(tetObject.tetGeometry(), tesselationParams));
		}
		if (tesselationParams.displaySharedFaces) {
			objects.push(tetSharedFacesToLines(tetObject.tetGeometry(), tesselationParams));
		}
		if (tesselationParams.displayCenter) {
			objects.push(tetToCenter(tetObject.tetGeometry(), tesselationParams));
		}
		return objects;
	}

	boundingBox(target: Box3): void {
		console.warn('boundingBox not implemented');
	}
	boundingSphere(target: Sphere): void {
		console.warn('boundingSphere not implemented');
	}
}

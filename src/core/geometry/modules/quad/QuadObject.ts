import {Material, Matrix4, Box3, Sphere, Object3D, Vector3} from 'three';
import {QUADObjectType, QUADTesselationParams} from './QuadCommon';
import {QuadGeometry} from './QuadGeometry';
import {
	ObjectContent,
	CoreObjectType,
	ObjectGeometryMap,
	objectContentCopyProperties,
	ObjectContentCopyPropertiesOptions,
} from '../../ObjectContent';
import {quadToObject3D} from './toObject3D/QuadToObject3D';
import {isArray} from '../../../Type';

const _box = new Box3();
const _size = new Vector3();

export class QuadObject implements ObjectContent<CoreObjectType.QUAD> {
	public visible = true;
	get geometry() {
		return this._geometry as ObjectGeometryMap[CoreObjectType.QUAD];
	}
	get type() {
		return this._type;
	}
	userData = {};
	name = '';
	castShadow = true;
	receiveShadow = true;
	renderOrder = 0;
	frustumCulled = true;
	matrixAutoUpdate = false;
	material: Material | undefined;
	children: ObjectContent<CoreObjectType.QUAD>[] = [];
	parent: ObjectContent<CoreObjectType.QUAD> | null = null;
	private _type: QUADObjectType;
	constructor(private _geometry: QuadGeometry) {
		this._type = QUADObjectType.DEFAULT;
	}

	quadGeometry() {
		return this.geometry! as QuadGeometry;
	}
	dispose() {}
	applyMatrix4(matrix: Matrix4) {
		this._geometry.applyMatrix(matrix);
	}
	add(...object: ObjectContent<CoreObjectType>[]) {}
	remove(...object: ObjectContent<CoreObjectType>[]) {}
	dispatchEvent(event: {type: string}) {}
	traverse(callback: (object: QuadObject) => any) {
		callback(this);
	}

	clone(): QuadObject {
		const clonedGeometry = this.geometry.clone();
		const clone = new QuadObject(clonedGeometry);
		objectContentCopyProperties(this, clone);
		return clone;
	}
	toObject3D(tesselationParams: QUADTesselationParams): Object3D | Object3D[] | undefined {
		const object = quadToObject3D(this, tesselationParams);

		const _objectContentCopyProperties = (src: QuadObject, dest: Object3D) => {
			const options: ObjectContentCopyPropertiesOptions = {
				// the lineSegments objects have castShadow and receiveShadow set to false,
				// we therefore should not take those properties into account
				// if they are false in the dest object
				castShadow: dest.castShadow,
				receiveShadow: dest.receiveShadow,
			};
			objectContentCopyProperties(src, dest, options);
		};

		if (object) {
			if (isArray(object)) {
				for (const element of object) {
					_objectContentCopyProperties(this, element);
				}
			} else {
				_objectContentCopyProperties(this, object);
			}
		}
		return object;
	}

	boundingBox(target: Box3): void {
		this.geometry.boundingBox(target);
	}
	boundingSphere(target: Sphere): void {
		this.boundingBox(_box);
		_box.getCenter(target.center);
		_box.getSize(_size);
		const diameter = Math.max(_size.x, _size.y, _size.z);
		target.radius = diameter * 0.5;
	}
}

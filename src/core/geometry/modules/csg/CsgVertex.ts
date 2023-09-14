import {Vector3} from 'three';
import {CoreVertex} from '../../entities/vertex/CoreVertex';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {VertexAttributesDict} from '../../entities/vertex/Common';
import {CsgObject} from './CsgObject';
import {CsgGeometryType} from './CsgCommon';

export class CsgVertex<T extends CsgGeometryType> extends CoreVertex<CoreObjectType.CSG> {
	constructor(object: CsgObject<T>, index: number) {
		super(object, index);
	}
	geometry() {
		return undefined;
	}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): VertexAttributesDict | undefined {
		return;
	}
	static override verticesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
	override position(target: Vector3) {
		console.warn('CsgVertex.position not implemented');
	}
	override normal(target: Vector3): Vector3 {
		console.warn('CsgVertex.normal not implemented');
		return target;
	}
}

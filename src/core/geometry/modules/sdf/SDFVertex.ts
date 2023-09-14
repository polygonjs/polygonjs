import {Vector3} from 'three';
import {CoreVertex} from '../../entities/vertex/CoreVertex';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {VertexAttributesDict} from '../../entities/vertex/Common';
import {SDFObject} from './SDFObject';

export class SDFVertex extends CoreVertex<CoreObjectType.SDF> {
	constructor(object: SDFObject, index: number) {
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
		console.warn('SDFVertex.position not implemented');
	}
	override normal(target: Vector3): Vector3 {
		console.warn('SDFVertex.normal not implemented');
		return target;
	}
}

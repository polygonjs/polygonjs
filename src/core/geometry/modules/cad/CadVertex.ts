import {Vector3} from 'three';
import {CoreVertex} from '../../entities/vertex/CoreVertex';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {VertexAttributesDict} from '../../entities/vertex/Common';
import {CadObject} from './CadObject';
import {CadGeometryType} from './CadCommon';

export class CadVertex<T extends CadGeometryType> extends CoreVertex<CoreObjectType.CAD> {
	constructor(object: CadObject<T>, index: number) {
		super(object, index);
	}
	geometry() {
		return undefined;
	}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): VertexAttributesDict | undefined {
		return;
	}
	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
	override position(target: Vector3): Vector3 {
		console.warn('CadVertex.position not implemented');
		return target;
	}
	override normal(target: Vector3): Vector3 {
		console.warn('CadVertex.normal not implemented');
		return target;
	}
}

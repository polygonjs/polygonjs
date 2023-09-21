import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CadGeometryType} from './CadCommon';
import {CadPrimitive} from './CadPrimitive';

export class CadPrimitiveEdge extends CadPrimitive<CadGeometryType.EDGE> {
	static primitiveName() {
		return 'edge';
	}
	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
}

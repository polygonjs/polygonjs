import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CadGeometryType} from './CadCommon';
import {CadPrimitive} from './CadPrimitive';

export class CadPrimitiveWire extends CadPrimitive<CadGeometryType.WIRE> {
	static primitiveName() {
		return 'wire';
	}
	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
}

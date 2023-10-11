import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CadGeometryType} from './CadCommon';
import {CadPrimitive} from './CadPrimitive';

export class CadPrimitiveFace extends CadPrimitive<CadGeometryType.FACE> {
	static primitiveName() {
		return 'face';
	}
	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
}

import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CadGeometryType} from './CadCommon';
import {CadPrimitive} from './CadPrimitive';

export class CadPrimitiveCompSolid extends CadPrimitive<CadGeometryType.COMPSOLID> {
	static primitiveName() {
		return 'compSolid';
	}
	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
}

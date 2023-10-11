import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CadGeometryType} from './CadCommon';
import {CadPrimitive} from './CadPrimitive';

export class CadPrimitiveShell extends CadPrimitive<CadGeometryType.SHELL> {
	static primitiveName() {
		return 'shell';
	}
	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
}

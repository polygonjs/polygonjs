import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CadGeometryType} from './CadCommon';
import {CadObject} from './CadObject';
import {CadPrimitive} from './CadPrimitive';
import {cadCompoundSubObjectsCount} from './toObject3D/CadCompound';

export class CadPrimitiveCompound extends CadPrimitive<CadGeometryType.COMPOUND> {
	static primitiveName() {
		return 'compound';
	}
	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		const cadOobject = object as any as CadObject<CadGeometryType.COMPOUND>;
		return cadCompoundSubObjectsCount(cadOobject);
	}
}

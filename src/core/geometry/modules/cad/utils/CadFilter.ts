import {CoreType} from '../../../../Type';
import {CadGeometryType, CadGeometryTypeShape} from '../CadCommon';
import {CoreCadType} from '../CadCoreType';
import {CadObject} from '../CadObject';

export function cadFilterObjects<T extends CadGeometryType>(
	cadObjects: CadObject<CadGeometryType>[] | undefined,
	type: T | Array<T>
) {
	if (!cadObjects) {
		return undefined;
	}
	if (CoreType.isArray(type)) {
		return cadObjects.filter((o) => type.includes(o.type as T)) as CadObject<T>[];
	} else {
		return cadObjects.filter((o) => o.type == type) as CadObject<T>[];
	}
}

export function cadFilterShapes<T extends CadGeometryTypeShape>(cadObjects: CadObject<CadGeometryType>[] | undefined) {
	if (!cadObjects) {
		return undefined;
	}
	return cadObjects.filter((o) => CoreCadType.isShape(o)) as CadObject<T>[];
}

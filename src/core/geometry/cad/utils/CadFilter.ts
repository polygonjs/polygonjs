import {CadGeometryType, CadGeometryTypeShape} from '../CadCommon';
import {CoreCadType} from '../CadCoreType';
import {CadObject} from '../CadObject';

export function cadFilterObjects<T extends CadGeometryType>(
	cadObjects: CadObject<CadGeometryType>[] | undefined,
	type: T
) {
	if (!cadObjects) {
		return undefined;
	}
	return cadObjects.filter((o) => o.type == type) as CadObject<T>[];
}

export function cadFilterShapes<T extends CadGeometryTypeShape>(cadObjects: CadObject<CadGeometryType>[] | undefined) {
	if (!cadObjects) {
		return undefined;
	}
	return cadObjects.filter((o) => CoreCadType.isShape(o)) as CadObject<T>[];
}

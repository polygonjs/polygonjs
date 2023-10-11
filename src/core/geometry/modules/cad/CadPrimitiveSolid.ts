import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {TopoDS_Shape} from './CadCommon';
import {CadGeometryType} from './CadCommon';
import {CadLoaderSync} from './CadLoaderSync';
import {CadObject} from './CadObject';
import {CadPrimitive} from './CadPrimitive';
import {traverseFaces} from './CadTraverse';

export class CadPrimitiveSolid extends CadPrimitive<CadGeometryType.SOLID> {
	static primitiveName() {
		return 'face';
	}
	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		const oc = CadLoaderSync.oc();
		const cadOobject = object as any as CadObject<CadGeometryType.SOLID>;
		let count = 0;
		const shape = cadOobject.geometry as TopoDS_Shape;
		traverseFaces(oc, shape, (face) => {
			count++;
		});

		return count;
	}
}

import {CadGeometryType, TopoDS_Edge, TopoDS_Wire} from '../CadCommon';
import {CadLoaderSync} from '../CadLoaderSync';
import {MapUtils} from '../../../MapUtils';
import {CadObject} from '../CadObject';

const objectsByType: Map<CadGeometryType, CadObject<CadGeometryType>[]> = new Map();
export function cadMergeCompact(inputObjects: CadObject<CadGeometryType>[]): CadObject<CadGeometryType>[] {
	objectsByType.clear();
	for (let inputObject of inputObjects) {
		MapUtils.pushOnArrayAtEntry(objectsByType, inputObject.type, inputObject);
	}

	const oc = CadLoaderSync.oc();

	const newObjects: CadObject<CadGeometryType>[] = [];

	objectsByType.forEach((objects, type) => {
		switch (type) {
			case CadGeometryType.EDGE: {
				const api = new oc.BRepBuilderAPI_MakeWire_1();
				for (let object of objects) {
					api.Add_1(object.cadGeometry() as TopoDS_Edge);
				}
				const wire = api.Wire();
				newObjects.push(new CadObject(wire, CadGeometryType.WIRE));
				return;
			}
			case CadGeometryType.WIRE: {
				const api = new oc.BRepBuilderAPI_MakeWire_1();
				for (let object of objects) {
					api.Add_2(object.cadGeometry() as TopoDS_Wire);
				}
				const wire = api.Wire();
				newObjects.push(new CadObject(wire, CadGeometryType.WIRE));
				return;
			}
			// case CadObjectType.FACE: {
			// 	// TODO
			// 	return;
			// }
			// case CadObjectType.SHELL: {
			// 	console.log(objects);
			// 	return;
			// }
			default: {
				for (let object of objects) {
					newObjects.push(object);
				}
			}
		}
	});
	return newObjects;
}

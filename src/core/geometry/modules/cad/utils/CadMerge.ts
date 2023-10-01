import {CadGeometryType, OpenCascadeInstance, TopoDS_Edge, TopoDS_Wire} from '../CadCommon';
import {CadLoaderSync} from '../CadLoaderSync';
import {MapUtils} from '../../../../MapUtils';
import {CadObject} from '../CadObject';

const objectsByType: Map<CadGeometryType, CadObject<CadGeometryType>[]> = new Map();
export function cadMergeCompact(inputObjects: CadObject<CadGeometryType>[]): CadObject<CadGeometryType>[] {
	objectsByType.clear();
	for (const inputObject of inputObjects) {
		MapUtils.pushOnArrayAtEntry(objectsByType, inputObject.type, inputObject);
	}

	const oc = CadLoaderSync.oc();

	const newObjects: CadObject<CadGeometryType>[] = [];

	objectsByType.forEach((objects, type) => {
		switch (type) {
			case CadGeometryType.EDGE: {
				return cadMergeCompactEdges(oc, objects as CadObject<CadGeometryType.EDGE>[], newObjects);
			}
			case CadGeometryType.WIRE: {
				return cadMergeCompactWires(oc, objects as CadObject<CadGeometryType.WIRE>[], newObjects);
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
				for (const object of objects) {
					newObjects.push(object);
				}
			}
		}
	});
	return newObjects;
}

export function cadMergeCompactEdges(
	oc: OpenCascadeInstance,
	objects: CadObject<CadGeometryType.EDGE>[],
	newObjects: CadObject<CadGeometryType>[]
) {
	const api = new oc.BRepBuilderAPI_MakeWire_1();
	for (const object of objects) {
		api.Add_1(object.cadGeometry() as TopoDS_Edge);
	}
	const wire = api.Wire();
	api.delete();
	newObjects.push(new CadObject(wire, CadGeometryType.WIRE));
	return;
}
export function cadMergeCompactWires(
	oc: OpenCascadeInstance,
	objects: CadObject<CadGeometryType.WIRE>[],
	newObjects: CadObject<CadGeometryType>[]
) {
	const api = new oc.BRepBuilderAPI_MakeWire_1();
	for (const object of objects) {
		api.Add_2(object.cadGeometry() as TopoDS_Wire);
	}
	const wire = api.Wire();
	api.delete();
	newObjects.push(new CadObject(wire, CadGeometryType.WIRE));
	return;
}

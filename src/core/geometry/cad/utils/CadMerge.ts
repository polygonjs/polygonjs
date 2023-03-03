import {CadCoreObject} from '../CadCoreObject';
import {CadObjectType, TopoDS_Edge, TopoDS_Wire} from '../CadCommon';
import {CadLoader} from '../CadLoader';
import {MapUtils} from '../../../MapUtils';

const objectsByType: Map<CadObjectType, CadCoreObject<CadObjectType>[]> = new Map();
export function cadMerge(inputObjects: CadCoreObject<CadObjectType>[]): CadCoreObject<CadObjectType>[] {
	objectsByType.clear();
	for (let inputObject of inputObjects) {
		let type = inputObject.type();
		MapUtils.pushOnArrayAtEntry(objectsByType, type, inputObject);
	}

	const oc = CadLoader.oc();

	const newObjects: CadCoreObject<CadObjectType>[] = [];

	objectsByType.forEach((objects, type) => {
		switch (type) {
			case CadObjectType.EDGE: {
				const api = new oc.BRepBuilderAPI_MakeWire_1();
				for (let object of objects) {
					api.Add_1(object.object() as TopoDS_Edge);
				}
				const wire = api.Wire();
				newObjects.push(new CadCoreObject(wire, CadObjectType.WIRE));
				return;
			}
			case CadObjectType.WIRE: {
				const api = new oc.BRepBuilderAPI_MakeWire_1();
				for (let object of objects) {
					api.Add_2(object.object() as TopoDS_Wire);
				}
				const wire = api.Wire();
				newObjects.push(new CadCoreObject(wire, CadObjectType.WIRE));
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

import {CADTesselationParams, cadDowncast, cadGeometryTypeFromShape, CadGeometryType} from '../CadCommon';
import {BaseSopNodeType} from '../../../../../engine/nodes/sop/_Base';
import {CadLoaderSync} from '../CadLoaderSync';
import {CadObject} from '../CadObject';
import {Object3D} from 'three';
import {isArray} from '../../../../Type';
import {MergeSopOperation} from '../../../../../engine/operations/sop/Merge';
import {isObject3D} from '../../../ObjectContent';

export function cadCompoundToObject3D(
	cadObject: CadObject<CadGeometryType.COMPOUND>,
	tesselationParams: CADTesselationParams,
	displayNode: BaseSopNodeType
) {
	const oc = CadLoaderSync.oc();
	const compound = cadObject.cadGeometry();

	const iterator = new oc.TopoDS_Iterator_2(compound, true, true);
	const iteratedObjects: Object3D[] = [];
	while (iterator.More()) {
		const newShape = cadDowncast(oc, iterator.Value());
		const type = cadGeometryTypeFromShape(oc, newShape);
		if (type) {
			const newObject = new CadObject(newShape, type);
			const result = newObject.toObject3D(tesselationParams, displayNode);
			if (result) {
				if (isArray(result)) {
					iteratedObjects.push(...result);
				} else {
					iteratedObjects.push(result);
				}
			}
		}

		iterator.Next();
	}
	iterator.delete();

	const newObjects = MergeSopOperation.makeCompact(iteratedObjects, {preserveMaterials: false}).filter(isObject3D);
	return newObjects;
}
export function cadCompoundSubObjectsCount(cadObject: CadObject<CadGeometryType.COMPOUND>): number {
	const oc = CadLoaderSync.oc();
	const compound = cadObject.cadGeometry();
	let count = 0;
	const iterator = new oc.TopoDS_Iterator_2(compound, true, true);
	while (iterator.More()) {
		count++;

		iterator.Next();
	}
	iterator.delete();
	return count;
}

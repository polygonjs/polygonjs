import {arrayToSet} from '../../../ArrayUtils';
import {stringToIndices} from '../../../String';
import {coreObjectInstanceFactory} from '../../CoreObjectFactory';
import {EntityGroupType} from '../../EntityGroupCollection';
import {CadGeometryType, OpenCascadeInstance, TopoDS_Edge, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire} from './CadCommon';
import {CadLoaderSync} from './CadLoaderSync';
import {CadObject} from './CadObject';

type YieldedEntity = TopoDS_Vertex | TopoDS_Edge | TopoDS_Wire;
type EntityCallback<E extends YieldedEntity> = (entity: E, index: number) => void;
type TraverseEntitiesFunction<E extends YieldedEntity> = (
	oc: OpenCascadeInstance,
	shape: TopoDS_Shape,
	callback: EntityCallback<E>
) => void;

const _indicesSet: Set<number> = new Set();
const _indices: number[] = [];

interface TraverseOptions<E extends YieldedEntity> {
	groupName: string;
	groupType: EntityGroupType;
	object: CadObject<CadGeometryType>;
	shape: TopoDS_Shape;
	traverseFunction: TraverseEntitiesFunction<E>;
	onEntityTraversed: EntityCallback<E>;
	onEntityNotInGroupTraversed?: EntityCallback<E>;
}

export class CadEntityGroupCollection {
	static traverseEntitiesInGroup<E extends YieldedEntity>(options: TraverseOptions<E>) {
		const {groupName, groupType, object, shape, traverseFunction, onEntityTraversed, onEntityNotInGroupTraversed} =
			options;
		const oc = CadLoaderSync.oc();
		if (groupName.trim() == '') {
			// no group
			traverseFunction(oc, shape, onEntityTraversed);
		} else {
			stringToIndices(groupName, _indices);
			if (_indices.length != 0) {
				// group by indices
				arrayToSet(_indices, _indicesSet);
				traverseFunction(oc, shape, (entity, i) => {
					if (_indicesSet.has(i)) {
						onEntityTraversed(entity, i);
					}
				});
			} else {
				const coreObject = coreObjectInstanceFactory(object);
				const groupCollection = coreObject.groupCollection();
				groupCollection.indicesSet(groupType, groupName, _indicesSet);
				traverseFunction(oc, shape, (entity, i) => {
					if (_indicesSet.has(i)) {
						onEntityTraversed(entity, i);
					} else if (onEntityNotInGroupTraversed) {
						onEntityNotInGroupTraversed(entity, i);
					}
				});
			}
		}
	}
}

/**
 * custom
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BufferAttribute, Vector3, Mesh, Object3D, Box3} from 'three';
import {triangleGraphFromGeometry} from '../../../core/geometry/modules/three/graph/triangle/TriangleGraphUtils';
import {setToArray} from '../../../core/SetUtils';
import {TriangleGraph} from '../../../core/geometry/modules/three/graph/triangle/TriangleGraph';
import {arrayCopy} from '../../../core/ArrayUtils';
import {triangleEdgePositions} from '../../../core/geometry/modules/three/graph/triangle/TriangleEdge';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {TypeAssert} from '../../poly/Assert';

const _p0 = new Vector3();
const _p1 = new Vector3();
const _box = new Box3();

export enum ExtrudeOpenEdgesFilterMethod {
	BELOW_Y = 'belowY',
	IN_BBOX = 'inBbox',
}
const FILTER_METHODS: ExtrudeOpenEdgesFilterMethod[] = [
	ExtrudeOpenEdgesFilterMethod.BELOW_Y,
	ExtrudeOpenEdgesFilterMethod.IN_BBOX,
];

class ExtrudeOpenEdgesSopParamConfig extends NodeParamsConfig {
	offset = ParamConfig.VECTOR3([0, 1, 0]);
	filterEdges = ParamConfig.BOOLEAN(false);
	/** @param filter method */
	filterMethod = ParamConfig.INTEGER(FILTER_METHODS.indexOf(ExtrudeOpenEdgesFilterMethod.BELOW_Y), {
		menu: {
			entries: FILTER_METHODS.map((name, value) => ({name, value})),
		},
		visibleIf: {
			filterEdges: true,
		},
	});
	bboxMin = ParamConfig.VECTOR3([-1, -1, -1], {
		visibleIf: {
			filterEdges: true,
			filterMethod: FILTER_METHODS.indexOf(ExtrudeOpenEdgesFilterMethod.IN_BBOX),
		},
	});
	bboxMax = ParamConfig.VECTOR3([1, 1, 1], {
		visibleIf: {
			filterEdges: true,
			filterMethod: FILTER_METHODS.indexOf(ExtrudeOpenEdgesFilterMethod.IN_BBOX),
		},
	});
	yThreshold = ParamConfig.FLOAT(0, {
		visibleIf: {
			filterEdges: true,
			filterMethod: FILTER_METHODS.indexOf(ExtrudeOpenEdgesFilterMethod.BELOW_Y),
		},
		range: [-1, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new ExtrudeOpenEdgesSopParamConfig();

export class ExtrudeOpenEdgesSopNode extends TypedSopNode<ExtrudeOpenEdgesSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.EXTRUDE_OPEN_EDGES;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.threejsObjects();
		for (const object of objects) {
			this._findAndExtrudeOpenEdges(object);
		}

		this.setCoreGroup(coreGroup);
	}
	private _findAndExtrudeOpenEdges(object: Object3D) {
		const mesh = object as Mesh;
		const geometry = mesh.geometry;
		if (!geometry) return;

		const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
		const index = geometry.getIndex();
		if (!(positionAttribute && index)) {
			return;
		}

		const graph = triangleGraphFromGeometry(mesh.geometry);
		if (!graph) {
			return;
		}
		const edgeIds: string[] = [];
		graph.edgeIds(edgeIds);
		const unsharedEdgeIdsSet: Set<string> = new Set();
		for (const edgeId of edgeIds) {
			const edge = graph.edge(edgeId);
			if (!edge) continue;
			if (edge.triangleIds.length == 1) {
				unsharedEdgeIdsSet.add(edgeId);
			}
		}
		let unsharedEdgeIds: string[] = [];
		setToArray(unsharedEdgeIdsSet, unsharedEdgeIds);

		const newPositionValues: number[] = [];
		const newIndexValues: number[] = [];
		arrayCopy(positionAttribute.array, newPositionValues);
		arrayCopy(index.array, newIndexValues);

		const filterMethod = FILTER_METHODS[this.pv.filterMethod];
		unsharedEdgeIds = this._filterEdgeIds(graph, unsharedEdgeIds, newPositionValues, filterMethod);
		for (const edgeId of unsharedEdgeIds) {
			this._extrudeEdge(graph, edgeId, newPositionValues, newIndexValues);
		}

		geometry.setAttribute('position', new BufferAttribute(new Float32Array(newPositionValues), 3));
		geometry.setIndex(newIndexValues);
	}
	private _filterEdgeIds(
		graph: TriangleGraph,
		edgeIds: string[],
		positionValues: number[],
		filterMethod: ExtrudeOpenEdgesFilterMethod
	): string[] {
		switch (filterMethod) {
			case ExtrudeOpenEdgesFilterMethod.BELOW_Y: {
				const yThreshold = this.pv.yThreshold;
				return edgeIds.filter((edgeId) => {
					const edge = graph.edge(edgeId);
					if (!edge) return false;
					triangleEdgePositions(edge, positionValues, _p0, _p1);
					return _p0.y < yThreshold && _p1.y < yThreshold;
				});
			}
			case ExtrudeOpenEdgesFilterMethod.IN_BBOX: {
				_box.min.copy(this.pv.bboxMin);
				_box.max.copy(this.pv.bboxMax);
				return edgeIds.filter((edgeId) => {
					const edge = graph.edge(edgeId);
					if (!edge) return false;
					triangleEdgePositions(edge, positionValues, _p0, _p1);
					_p0.add(_p1).divideScalar(2);
					return _box.containsPoint(_p0);
				});
			}
		}
		TypeAssert.unreachable(filterMethod);
	}
	private _extrudeEdge(graph: TriangleGraph, edgeId: string, newPositionValues: number[], newIndexValues: number[]) {
		const edge = graph.edge(edgeId);
		if (!edge) return;
		const otherTriangleId = edge.triangleIds[0];
		const otherTriangle = graph.triangle(otherTriangleId)!;
		// we need to know what order we can use the 2 indices of this edge.
		// In order to know this, we first look at the triangle that this edge belongs to.
		// we then check if the 2 indices are in the same order as in otherTriangle.triangle.
		// If they are, we need to invert the indices.
		// If not, we don't invert.
		const id0Index = otherTriangle.triangle.indexOf(edge.pointIdPair.id0);
		const id1Index = otherTriangle.triangle.indexOf(edge.pointIdPair.id1);
		// with "id1Index - id0Index == 1", we check that the 2 indices are consecutive:
		// with indices [a,b,c],
		// we therefore check that they are a-b or b-c.
		// But they are a-c, then comparing that an index is less than the other is not useful,
		// as the actual edge would be c-a.
		const invertRequired = id0Index < id1Index && id1Index - id0Index == 1;

		//
		const pointIdPair = edge.pointIdPair;
		triangleEdgePositions(edge, newPositionValues, _p0, _p1);
		_p0.add(this.pv.offset);
		_p1.add(this.pv.offset);

		const p0Index = newPositionValues.length / 3;
		const p1Index = p0Index + 1;
		newPositionValues.push(_p0.x, _p0.y, _p0.z);
		newPositionValues.push(_p1.x, _p1.y, _p1.z);

		if (invertRequired) {
			newIndexValues.push(pointIdPair.id1, pointIdPair.id0, p0Index);
			newIndexValues.push(pointIdPair.id1, p0Index, p1Index);
		} else {
			newIndexValues.push(pointIdPair.id0, pointIdPair.id1, p0Index);
			newIndexValues.push(p0Index, pointIdPair.id1, p1Index);
		}
	}
}

/**
 * Creates a CAD segment
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import type {TopoDS_Vertex, OpenCascadeInstance, gp_Pnt2d} from '../../../core/geometry/cad/CadCommon';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';
import {CadGeometryType} from '../../../core/geometry/cad/CadCommon';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {TypeAssert} from '../../poly/Assert';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {cadFilterObjects} from '../../../core/geometry/cad/utils/CadFilter';

enum SegmentMode {
	FROM_PAIRS = 'from pairs',
	LINK_ALL = 'link all',
}
const SEGMENT_MODES: SegmentMode[] = [SegmentMode.FROM_PAIRS, SegmentMode.LINK_ALL];

class CADSegmentSopParamsConfig extends NodeParamsConfig {
	/** @param mode */

	mode = ParamConfig.INTEGER(SEGMENT_MODES.indexOf(SegmentMode.LINK_ALL), {
		menu: {
			entries: SEGMENT_MODES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new CADSegmentSopParamsConfig();

export class CADSegmentSopNode extends CADSopNode<CADSegmentSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_SEGMENT;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1, 2);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core();

		const mode = SEGMENT_MODES[this.pv.mode];
		switch (mode) {
			case SegmentMode.FROM_PAIRS: {
				return this._createSegmentsFromPairs(oc, inputCoreGroups);
			}
			case SegmentMode.LINK_ALL: {
				return this._createSegmentsFromAll(oc, inputCoreGroups);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _createSegmentsFromPairs(oc: OpenCascadeInstance, inputCoreGroups: CoreGroup[]) {
		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputCoreGroup0 = inputCoreGroups[0];
		const inputCoreGroup1 = inputCoreGroups[1];
		if (!inputCoreGroup1) {
			this.states.error.set('input 1 required for this mode');
			return;
		}
		_createSegmentsFromVertexPairs(oc, inputCoreGroup0, inputCoreGroup1, newObjects);
		_createSegmentsFromPoint2DPairs(oc, inputCoreGroup0, inputCoreGroup1, newObjects);
		this.setCADObjects(newObjects);
	}
	private _createSegmentsFromAll(oc: OpenCascadeInstance, inputCoreGroups: CoreGroup[]) {
		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputCoreGroup0 = inputCoreGroups[0];
		const inputCoreGroup1 = inputCoreGroups[1];
		let vertexObjects = cadFilterObjects(inputCoreGroup0.cadObjects(), CadGeometryType.VERTEX);
		let point2DObjects = cadFilterObjects(inputCoreGroup0.cadObjects(), CadGeometryType.POINT_2D);
		if (vertexObjects) {
			if (inputCoreGroup1) {
				const vertexObjects1 = cadFilterObjects(inputCoreGroup1.cadObjects(), CadGeometryType.VERTEX);
				if (vertexObjects1) {
					vertexObjects = vertexObjects.concat(vertexObjects1);
				}
			}
			_createSegmentsFromAllVertices(oc, vertexObjects, newObjects);
		}
		if (point2DObjects) {
			if (inputCoreGroup1) {
				const pointObjects1 = cadFilterObjects(inputCoreGroup1.cadObjects(), CadGeometryType.POINT_2D);
				if (pointObjects1) {
					point2DObjects = point2DObjects.concat(pointObjects1);
				}
			}
			_createSegmentsFromAllPoint2D(oc, point2DObjects, newObjects);
		}
		this.setCADObjects(newObjects);
	}
}

function _createSegmentsFromAllVertices(
	oc: OpenCascadeInstance,
	coreObjects: CadObject<CadGeometryType.VERTEX>[],
	newObjects: CadObject<CadGeometryType>[]
) {
	let previousVertexObject: CadObject<CadGeometryType.VERTEX> | undefined;
	for (let inputObject of coreObjects) {
		if (previousVertexObject) {
			newObjects.push(_createSegment(oc, previousVertexObject.cadGeometry(), inputObject.cadGeometry()));
		}
		previousVertexObject = inputObject;
	}
}
function _createSegmentsFromAllPoint2D(
	oc: OpenCascadeInstance,
	coreObjects: CadObject<CadGeometryType.POINT_2D>[],
	newObjects: CadObject<CadGeometryType>[]
) {
	let previousPoint2DObject: CadObject<CadGeometryType.POINT_2D> | undefined;
	for (let inputObject of coreObjects) {
		if (previousPoint2DObject) {
			newObjects.push(_createSegment2d(oc, previousPoint2DObject.cadGeometry(), inputObject.cadGeometry()));
		}
		previousPoint2DObject = inputObject;
	}
}

function _createSegmentsFromVertexPairs(
	oc: OpenCascadeInstance,
	inputCoreGroup0: CoreGroup,
	inputCoreGroup1: CoreGroup,
	newObjects: CadObject<CadGeometryType>[]
) {
	const inputVertexObjects0 = cadFilterObjects(inputCoreGroup0.cadObjects(), CadGeometryType.VERTEX);
	const inputVertexObjects1 = cadFilterObjects(inputCoreGroup1.cadObjects(), CadGeometryType.VERTEX);
	if (inputVertexObjects0 && inputVertexObjects1) {
		const minVerticesCount = Math.min(inputVertexObjects0.length, inputVertexObjects1.length);
		for (let i = 0; i < minVerticesCount; i++) {
			const vertex0 = inputVertexObjects0[i].cadGeometry();
			const vertex1 = inputVertexObjects1[i].cadGeometry();
			newObjects.push(_createSegment(oc, vertex0, vertex1));
		}
	}
}
function _createSegmentsFromPoint2DPairs(
	oc: OpenCascadeInstance,
	inputCoreGroup0: CoreGroup,
	inputCoreGroup1: CoreGroup,
	newObjects: CadObject<CadGeometryType>[]
) {
	const inputPoint2DObjects0 = cadFilterObjects(inputCoreGroup0.cadObjects(), CadGeometryType.POINT_2D);
	const inputPoint2DObjects1 = cadFilterObjects(inputCoreGroup1.cadObjects(), CadGeometryType.POINT_2D);
	if (inputPoint2DObjects0 && inputPoint2DObjects1) {
		const minPoint2DCount = Math.min(inputPoint2DObjects0.length, inputPoint2DObjects1.length);
		for (let i = 0; i < minPoint2DCount; i++) {
			const point2D0 = inputPoint2DObjects0[i].cadGeometry();
			const point2D1 = inputPoint2DObjects1[i].cadGeometry();
			newObjects.push(_createSegment2d(oc, point2D0, point2D1));
		}
	}
}

function _createSegment(oc: OpenCascadeInstance, vertex0: TopoDS_Vertex, vertex1: TopoDS_Vertex) {
	const point0 = oc.BRep_Tool.Pnt(vertex0);
	const point1 = oc.BRep_Tool.Pnt(vertex1);
	const segment = new oc.GC_MakeSegment_1(point0, point1);
	const curve = segment.Value().get();
	const edge = cadEdgeCreate(oc, curve);

	return new CadObject(edge, CadGeometryType.EDGE);
}
function _createSegment2d(oc: OpenCascadeInstance, point0: gp_Pnt2d, point1: gp_Pnt2d) {
	const segment = new oc.GCE2d_MakeSegment_1(point0, point1);
	const curve = segment.Value().get();
	return new CadObject(curve, CadGeometryType.CURVE_2D);
}

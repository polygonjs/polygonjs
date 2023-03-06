// /**
//  * Creates a segment
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import type {TopoDS_Vertex, OpenCascadeInstance, gp_Pnt2d} from '../../../core/geometry/cad/CadCommon';
// import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';
// import {CadObjectType} from '../../../core/geometry/cad/CadCommon';
// import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';
// import {TypeAssert} from '../../poly/Assert';

// enum SegmentMode {
// 	FROM_PAIRS = 'from pairs',
// 	LINK_ALL = 'link all',
// }
// const SEGMENT_MODES: SegmentMode[] = [SegmentMode.FROM_PAIRS, SegmentMode.LINK_ALL];

// class SegmentCadParamsConfig extends NodeParamsConfig {
// 	/** @param mode */

// 	mode = ParamConfig.INTEGER(SEGMENT_MODES.indexOf(SegmentMode.LINK_ALL), {
// 		menu: {
// 			entries: SEGMENT_MODES.map((name, value) => ({name, value})),
// 		},
// 	});
// }
// const ParamsConfig = new SegmentCadParamsConfig();

// export class SegmentCadNode extends TypedCadNode<SegmentCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'segment';
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1, 2);
// 	}

// 	override async cook(inputCoreGroups: CadCoreGroup[]) {
// 		const oc = await CadLoader.core();

// 		const mode = SEGMENT_MODES[this.pv.mode];
// 		switch (mode) {
// 			case SegmentMode.FROM_PAIRS: {
// 				return this._createSegmentsFromPairs(oc, inputCoreGroups);
// 			}
// 			case SegmentMode.LINK_ALL: {
// 				return this._createSegmentsFromAll(oc, inputCoreGroups);
// 			}
// 		}
// 		TypeAssert.unreachable(mode);
// 	}

// 	private _createSegmentsFromPairs(oc: OpenCascadeInstance, inputCoreGroups: CadCoreGroup[]) {
// 		const newObjects: CadCoreObject<CadObjectType>[] = [];
// 		const inputCoreGroup0 = inputCoreGroups[0];
// 		const inputCoreGroup1 = inputCoreGroups[1];
// 		if (!inputCoreGroup1) {
// 			this.states.error.set('input 1 required for this mode');
// 			return;
// 		}
// 		_createSegmentsFromVertexPairs(oc, inputCoreGroup0, inputCoreGroup1, newObjects);
// 		_createSegmentsFromPoint2DPairs(oc, inputCoreGroup0, inputCoreGroup1, newObjects);
// 		this.setCadObjects(newObjects);
// 	}
// 	private _createSegmentsFromAll(oc: OpenCascadeInstance, inputCoreGroups: CadCoreGroup[]) {
// 		const newObjects: CadCoreObject<CadObjectType>[] = [];
// 		const inputCoreGroup0 = inputCoreGroups[0];
// 		const inputCoreGroup1 = inputCoreGroups[1];
// 		let vertexObjects = inputCoreGroup0.objectsWithType(CadObjectType.VERTEX);
// 		let point2DObjects = inputCoreGroup0.objectsWithType(CadObjectType.POINT_2D);
// 		if (inputCoreGroup1) {
// 			vertexObjects = vertexObjects.concat(inputCoreGroup1.objectsWithType(CadObjectType.VERTEX));
// 			point2DObjects = point2DObjects.concat(inputCoreGroup1.objectsWithType(CadObjectType.POINT_2D));
// 		}
// 		_createSegmentsFromAllVertices(oc, vertexObjects, newObjects);
// 		_createSegmentsFromAllPoint2D(oc, point2DObjects, newObjects);
// 		this.setCadObjects(newObjects);
// 	}
// }

// function _createSegmentsFromAllVertices(
// 	oc: OpenCascadeInstance,
// 	coreObjects: CadCoreObject<CadObjectType.VERTEX>[],
// 	newObjects: CadCoreObject<CadObjectType>[]
// ) {
// 	let previousVertexObject: CadCoreObject<CadObjectType.VERTEX> | undefined;
// 	for (let inputObject of coreObjects) {
// 		if (previousVertexObject) {
// 			newObjects.push(_createSegment(oc, previousVertexObject.object(), inputObject.object()));
// 		}
// 		previousVertexObject = inputObject;
// 	}
// }
// function _createSegmentsFromAllPoint2D(
// 	oc: OpenCascadeInstance,
// 	coreObjects: CadCoreObject<CadObjectType.POINT_2D>[],
// 	newObjects: CadCoreObject<CadObjectType>[]
// ) {
// 	let previousPoint2DObject: CadCoreObject<CadObjectType.POINT_2D> | undefined;
// 	for (let inputObject of coreObjects) {
// 		if (previousPoint2DObject) {
// 			newObjects.push(_createSegment2d(oc, previousPoint2DObject.object(), inputObject.object()));
// 		}
// 		previousPoint2DObject = inputObject;
// 	}
// }

// function _createSegmentsFromVertexPairs(
// 	oc: OpenCascadeInstance,
// 	inputCoreGroup0: CadCoreGroup,
// 	inputCoreGroup1: CadCoreGroup,
// 	newObjects: CadCoreObject<CadObjectType>[]
// ) {
// 	const inputVertexObjects0 = inputCoreGroup0.objectsWithType(CadObjectType.VERTEX);
// 	const inputVertexObjects1 = inputCoreGroup1.objectsWithType(CadObjectType.VERTEX);
// 	const minVerticesCount = Math.min(inputVertexObjects0.length, inputVertexObjects1.length);
// 	for (let i = 0; i < minVerticesCount; i++) {
// 		const vertex0 = inputVertexObjects0[i].object();
// 		const vertex1 = inputVertexObjects1[i].object();
// 		newObjects.push(_createSegment(oc, vertex0, vertex1));
// 	}
// }
// function _createSegmentsFromPoint2DPairs(
// 	oc: OpenCascadeInstance,
// 	inputCoreGroup0: CadCoreGroup,
// 	inputCoreGroup1: CadCoreGroup,
// 	newObjects: CadCoreObject<CadObjectType>[]
// ) {
// 	const inputPoint2DObjects0 = inputCoreGroup0.objectsWithType(CadObjectType.POINT_2D);
// 	const inputPoint2DObjects1 = inputCoreGroup1.objectsWithType(CadObjectType.POINT_2D);
// 	const minPoint2DCount = Math.min(inputPoint2DObjects0.length, inputPoint2DObjects1.length);
// 	for (let i = 0; i < minPoint2DCount; i++) {
// 		const point2D0 = inputPoint2DObjects0[i].object();
// 		const point2D1 = inputPoint2DObjects1[i].object();
// 		newObjects.push(_createSegment2d(oc, point2D0, point2D1));
// 	}
// }

// function _createSegment(oc: OpenCascadeInstance, vertex0: TopoDS_Vertex, vertex1: TopoDS_Vertex) {
// 	const point0 = oc.BRep_Tool.Pnt(vertex0);
// 	const point1 = oc.BRep_Tool.Pnt(vertex1);
// 	const segment = new oc.GC_MakeSegment_1(point0, point1);
// 	const curve = segment.Value().get();
// 	const edge = cadEdgeCreate(oc, curve);

// 	return new CadCoreObject(edge, CadObjectType.EDGE);
// }
// function _createSegment2d(oc: OpenCascadeInstance, point0: gp_Pnt2d, point1: gp_Pnt2d) {
// 	const segment = new oc.GCE2d_MakeSegment_1(point0, point1);
// 	const curve = segment.Value().get();
// 	return new CadCoreObject(curve, CadObjectType.CURVE_2D);
// }

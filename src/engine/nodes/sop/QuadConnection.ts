/**
 * Creates a line displaying the connections between 2 quads.
 *
 *
 */

import {Vector3, BufferGeometry, Float32BufferAttribute} from 'three';
import {QuadSopNode} from './_BaseQuad';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {HalfEdgeIndices} from '../../../core/geometry/modules/quad/graph/QuadGraphCommon';
import {QuadObject} from '../../../core/geometry/modules/quad/QuadObject';
import {
	halfEdgeIndicesInCommonBetweenQuads,
	pointInCommonBetweenQuadsSharingPoint,
	quadGraphFromQuadObject,
} from '../../../core/geometry/modules/quad/graph/QuadGraphUtils';
import {QuadPrimitive} from '../../../core/geometry/modules/quad/QuadPrimitive';
import {Attribute} from '../../../core/geometry/Attribute';
import {ObjectType} from '../../../core/geometry/Constant';
import {arrayDifference} from '../../../core/ArrayUtils';

const _neighbourIdsSharingEdge: number[] = [];
const _neighbourIdsSharingPoint: number[] = [];
const _neighbourIdsSharingPointOnly: number[] = [];
const _quadCenter0 = new Vector3();
const _quadCenter1 = new Vector3();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _center = new Vector3();
const _halfEdgeIndices: HalfEdgeIndices = {
	index0: -1,
	index1: -1,
};

export enum QuadConnectionMode {
	NEIGHBOUR_INDEX = 'neighbourIndex',
	QUAD_ID = 'quadId',
}
export const QUAD_CONNECTION_MODES: QuadConnectionMode[] = [
	QuadConnectionMode.NEIGHBOUR_INDEX,
	QuadConnectionMode.QUAD_ID,
];

export enum QuadConnectionType {
	STRAIGHT = 'straight',
	DIAGONAL = 'diagonal',
}
export const QUAD_CONNECTION_TYPES: QuadConnectionType[] = [QuadConnectionType.STRAIGHT, QuadConnectionType.DIAGONAL];

class QuadConnectionSopParamsConfig extends NodeParamsConfig {
	mode = ParamConfig.INTEGER(QUAD_CONNECTION_MODES.indexOf(QuadConnectionMode.NEIGHBOUR_INDEX), {
		menu: {
			entries: QUAD_CONNECTION_MODES.map((name, value) => ({name, value})),
		},
	});
	type = ParamConfig.INTEGER(QUAD_CONNECTION_TYPES.indexOf(QuadConnectionType.STRAIGHT), {
		menu: {
			entries: QUAD_CONNECTION_TYPES.map((name, value) => ({name, value})),
		},
		visibleIf: {
			mode: QUAD_CONNECTION_MODES.indexOf(QuadConnectionMode.NEIGHBOUR_INDEX),
		},
	});
	quadId0 = ParamConfig.INTEGER(0, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	quadId1 = ParamConfig.INTEGER(0, {
		range: [0, 100],
		rangeLocked: [true, false],
		visibleIf: {
			mode: QUAD_CONNECTION_MODES.indexOf(QuadConnectionMode.QUAD_ID),
		},
	});
	neighbourIndex = ParamConfig.INTEGER(0, {
		range: [0, 4],
		rangeLocked: [true, false],
		visibleIf: {
			mode: QUAD_CONNECTION_MODES.indexOf(QuadConnectionMode.NEIGHBOUR_INDEX),
		},
	});
}
const ParamsConfig = new QuadConnectionSopParamsConfig();

export class QuadConnectionSopNode extends QuadSopNode<QuadConnectionSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUAD_CONNECTION;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	setConnectionMode(mode: QuadConnectionMode) {
		this.p.mode.set(QUAD_CONNECTION_MODES.indexOf(mode));
	}
	connectionMode() {
		return QUAD_CONNECTION_MODES[this.pv.mode];
	}
	setConnectionType(type: QuadConnectionType) {
		this.p.type.set(QUAD_CONNECTION_TYPES.indexOf(type));
	}
	connectionType() {
		return QUAD_CONNECTION_TYPES[this.pv.type];
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const quadObjects = coreGroup.quadObjects();

		const newGeometries: BufferGeometry[] = [];
		if (quadObjects) {
			for (const object of quadObjects) {
				const newGeometry = this._process(object);
				if (newGeometry) {
					newGeometries.push(newGeometry);
				}
			}
		}
		this.setGeometries(newGeometries, ObjectType.LINE_SEGMENTS);
	}
	private _process(quadObject: QuadObject): BufferGeometry | undefined {
		const graph = quadGraphFromQuadObject(quadObject);

		const {quadId0} = this.pv;
		const mode = this.connectionMode();
		const type = this.connectionType();
		if (graph.quadNode(quadId0) == null) {
			return;
		}

		const getQuadId1ByNeighbourIndex = () => {
			graph.neighbourIdsSharingEdge(quadId0, _neighbourIdsSharingEdge);

			if (type == QuadConnectionType.STRAIGHT) {
				return _neighbourIdsSharingEdge[this.pv.neighbourIndex];
			} else {
				graph.neighbourIdsSharingPoint(quadId0, _neighbourIdsSharingPoint);
				arrayDifference(_neighbourIdsSharingPoint, _neighbourIdsSharingEdge, _neighbourIdsSharingPointOnly);
				return _neighbourIdsSharingPointOnly[this.pv.neighbourIndex];
			}
		};

		const quadId1: number =
			mode == QuadConnectionMode.NEIGHBOUR_INDEX ? getQuadId1ByNeighbourIndex() : this.pv.quadId1;

		if (graph.quadNode(quadId1) == null) {
			return;
		}

		QuadPrimitive.position(quadObject, quadId0, _quadCenter0);
		QuadPrimitive.position(quadObject, quadId1, _quadCenter1);

		const srcPositions = quadObject.geometry.attributes[Attribute.POSITION].array;
		const geometry = new BufferGeometry();

		if (type == QuadConnectionType.STRAIGHT) {
			halfEdgeIndicesInCommonBetweenQuads({
				quadObject,
				quadId0,
				quadId1,
				target: _halfEdgeIndices,
			});
			_p0.fromArray(srcPositions, _halfEdgeIndices.index0 * 3);
			_p1.fromArray(srcPositions, _halfEdgeIndices.index1 * 3);
			_center.copy(_p0).add(_p1).multiplyScalar(0.5);
		} else {
			const sharedPointId = pointInCommonBetweenQuadsSharingPoint(graph, quadId0, quadId1);
			if (sharedPointId != null) {
				_center.fromArray(srcPositions, sharedPointId * 3);
			}
		}

		const positions: Float32Array = new Float32Array(9);
		_quadCenter0.toArray(positions, 0);
		_center.toArray(positions, 3);
		_quadCenter1.toArray(positions, 6);

		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex([0, 1, 1, 2]);
		return geometry;
	}
}

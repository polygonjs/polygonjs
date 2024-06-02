/**
 * Extrudes quads.
 *
 *
 */
import {QuadSopNode} from './_BaseQuad';
import {Vector3} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {QuadObject} from '../../../core/geometry/modules/quad/QuadObject';
import {QuadPrimitive} from '../../../core/geometry/modules/quad/QuadPrimitive';
import {primitivesFromObject} from '../../../core/geometry/entities/primitive/CorePrimitiveUtils';
import {
	QuadPrimitivePointPositions,
	QuadPrimitivePointIndices,
} from '../../../core/geometry/modules/quad/utils/QuadUtils';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {quadGraphFromQuadObject} from '../../../core/geometry/modules/quad/graph/QuadGraphUtils';
import {QuadNode} from '../../../core/geometry/modules/quad/graph/QuadNode';

const _primitives: QuadPrimitive[] = [];

export const _indices: QuadPrimitivePointIndices = {
	i0: 0,
	i1: 0,
	i2: 0,
	i3: 0,
};
export const _positions: QuadPrimitivePointPositions = {
	p0: new Vector3(),
	p1: new Vector3(),
	p2: new Vector3(),
	p3: new Vector3(),
};
export const _insetPositions: QuadPrimitivePointPositions = {
	p0: new Vector3(),
	p1: new Vector3(),
	p2: new Vector3(),
	p3: new Vector3(),
};
const neighbourIdsSharingPoint: number[] = [];
const neighbourIdsSharingEdge: number[] = [];
const neighbourColorIds: Set<number> = new Set();

class QuadUniqueNeighbourIdSopParamsConfig extends NodeParamsConfig {
	/** @param attribName */
	attribName = ParamConfig.STRING('colorId');
}
const ParamsConfig = new QuadUniqueNeighbourIdSopParamsConfig();

export class QuadUniqueNeighbourIdSopNode extends QuadSopNode<QuadUniqueNeighbourIdSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUAD_UNIQUE_NEIGHBOUR_ID;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.quadObjects();
		if (!objects) {
			this.states.error.set(`no quad objects found`);
			return;
		}
		for (const object of objects) {
			this._processObject(object);
		}

		this.setQuadObjects(objects);
	}

	private _processObject(object: QuadObject) {
		const graph = quadGraphFromQuadObject(object);
		const colorIdByQuadId: Map<number, number> = new Map();
		const firstQuad = graph.quadNode(0);
		if (!firstQuad) {
			return;
		}
		const stack: QuadNode[] = [firstQuad];
		let maxColorId = 0;
		while (stack.length > 0) {
			const currentQuad = stack.shift()!;
			const quadId = currentQuad.id;
			if (!colorIdByQuadId.has(quadId) /* check if we have already visited it */) {
				graph.neighbourIdsSharingEdge(quadId, neighbourIdsSharingEdge);
				graph.neighbourIdsSharingPoint(quadId, neighbourIdsSharingPoint);
				neighbourColorIds.clear();
				for (const neighbourId of neighbourIdsSharingEdge) {
					const colorId = colorIdByQuadId.get(neighbourId);
					if (colorId != null) {
						neighbourColorIds.add(colorId);
					}
				}
				for (let i = 0; i <= maxColorId; i++) {
					if (!neighbourColorIds.has(i)) {
						colorIdByQuadId.set(quadId, i);
						break;
					}
				}
				if (!colorIdByQuadId.has(quadId)) {
					maxColorId++;
					colorIdByQuadId.set(quadId, maxColorId);
				}

				// traverse neighbours
				for (const neighbourId of neighbourIdsSharingPoint) {
					const quadNode = graph.quadNode(neighbourId);
					if (quadNode) {
						stack.push(quadNode);
					}
				}
			}
		}

		// add attribute
		const attribName = this.pv.attribName;
		let attribute = QuadPrimitive.attribute(object, attribName);
		if (!attribute) {
			const primitivesCount = QuadPrimitive.entitiesCount(object);
			const values = new Array(primitivesCount * 1).fill(-1);
			attribute = {array: values, itemSize: 1, isString: false};
			QuadPrimitive.addAttribute(object, attribName, attribute);
		}

		primitivesFromObject(object, _primitives);
		let i = 0;
		for (const primitive of _primitives) {
			const colorId = colorIdByQuadId.get(i);
			if (colorId != null) {
				primitive.setAttribValue(attribName, colorId);
			}
			i++;
		}
	}
}

import {LineBasicMaterial, Color, Vector4, Vector3, BufferGeometry, BufferAttribute, LineSegments} from 'three';
import {QuadObject} from '../QuadObject';
import {QUADTesselationParams} from '../QuadCommon';
import {Attribute} from '../../../Attribute';
import {QuadPrimitive} from '../QuadPrimitive';
import {stringMatchMask} from '../../../../String';
import {ThreejsPrimitiveTriangle} from '../../three/ThreejsPrimitiveTriangle';
import {prepareObject} from './QuadToObject3DCommon';
import {NEIGHBOUR_INDICES, HalfEdgeIndices, quadHalfEdgeIndices} from '../graph/QuadGraphCommon';
import {NeighbourData, QuadGraph} from '../graph/QuadGraph';

const _v4 = new Vector4();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const _p3 = new Vector3();

const _neighbourData: NeighbourData = {
	quadNode: null,
	neighbourIndex: null,
};
const _indices: HalfEdgeIndices = {
	index0: -1,
	index1: -1,
};

const _lineMaterialByColorStyle: Map<string, LineBasicMaterial> = new Map();
function _createOrFindLineMaterial(color: Color) {
	let material = _lineMaterialByColorStyle.get(color.getStyle());
	if (!material) {
		material = new LineBasicMaterial({
			color,
			linewidth: 1,
		});
		_lineMaterialByColorStyle.set(color.getStyle(), material);
	}
	return material;
}

export function quadToLine(quadObject: QuadObject, graph:QuadGraph,options: QUADTesselationParams) {
	const {splitQuads, unsharedEdges, wireframeColor} = options;
	const quadGeometry = quadObject.geometry;
	const quadsCount = quadGeometry.quadsCount();
	const indices = quadGeometry.index;
	const srcPositions = quadGeometry.attributes.position.array;

	const edges = new Map<number, number>();

	const buildUnsharedEdges = () => {
		const newIndices: number[] = new Array();
		const positions: number[] = [];

		for (let i = 0; i < quadsCount; i++) {
			const currentNode = graph.quadNode(i)!;

			for (const ni of NEIGHBOUR_INDICES) {
				graph.neighbourData(i, ni, _neighbourData);
				if (_neighbourData.quadNode == null) {
					quadHalfEdgeIndices(currentNode.indices, ni, _indices);
					const i0 = _indices.index0;
					const i1 = _indices.index1;
					_p0.fromArray(srcPositions, i0 * 3);
					_p1.fromArray(srcPositions, i1 * 3);
					positions.push(_p0.x, _p0.y, _p0.z);
					positions.push(_p1.x, _p1.y, _p1.z);
					newIndices.push(newIndices.length);
					newIndices.push(newIndices.length);
				}
			}
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(positions), 3));
		geometry.setIndex(newIndices);
		return geometry;
	};

	const splitGeometry = () => {
		const newIndices: number[] = new Array();
		const positions: number[] = [];

		for (let i = 0; i < quadsCount; i++) {
			_v4.fromArray(indices, i * 4);
			_p0.fromArray(srcPositions, _v4.x * 3);
			_p1.fromArray(srcPositions, _v4.y * 3);
			_p2.fromArray(srcPositions, _v4.z * 3);
			_p3.fromArray(srcPositions, _v4.w * 3);

			const j = i * 4 * 3;
			const k = i * 8;
			const m = i * 4;
			_p0.toArray(positions, j);
			_p1.toArray(positions, j + 3);
			_p2.toArray(positions, j + 6);
			_p3.toArray(positions, j + 9);

			newIndices[k] = m;
			newIndices[k + 1] = m + 1;
			newIndices[k + 2] = m + 1;
			newIndices[k + 3] = m + 2;
			newIndices[k + 4] = m + 2;
			newIndices[k + 5] = m + 3;
			newIndices[k + 6] = m + 3;
			newIndices[k + 7] = m;
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(positions), 3));
		geometry.setIndex(newIndices);
		return geometry;
	};

	const unsplitGeometry = () => {
		const newIndices: number[] = new Array();
		const addEdgeUnsplit = (a: number, b: number) => {
			if (edges.get(a) == b || edges.get(b) == a) {
				return;
			}
			edges.set(a, b);
			edges.set(b, a);
			newIndices.push(a, b);
		};
		for (let i = 0; i < quadsCount; i++) {
			_v4.fromArray(indices, i * 4);
			addEdgeUnsplit(_v4.x, _v4.y);
			addEdgeUnsplit(_v4.y, _v4.z);
			addEdgeUnsplit(_v4.z, _v4.w);
			addEdgeUnsplit(_v4.w, _v4.x);
		}

		const positions = [...srcPositions];
		const geometry = new BufferGeometry();
		geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(positions), 3));
		geometry.setIndex(newIndices);
		return geometry;
	};

	const geometry = unsharedEdges ? buildUnsharedEdges() : splitQuads ? splitGeometry() : unsplitGeometry();
	const material = _createOrFindLineMaterial(wireframeColor);
	const lineSegments = new LineSegments(geometry, material);

	// primitive attributes
	if (splitQuads) {
		const primitiveAttributes = QuadPrimitive.attributesFromGeometry(quadGeometry);
		if (primitiveAttributes) {
			const primitiveAttributeNames = Object.keys(primitiveAttributes).filter((attributeName) =>
				stringMatchMask(attributeName, options.primitiveAttributes)
			);
			for (const primitiveAttributeName of primitiveAttributeNames) {
				const srcAttribute = primitiveAttributes[primitiveAttributeName];
				const destPrimitivesCount = quadsCount * 4;
				const destAttribute = {
					itemSize: srcAttribute.itemSize,
					isString: srcAttribute.isString,
					array: new Array(destPrimitivesCount * srcAttribute.itemSize),
				};
				ThreejsPrimitiveTriangle.addAttribute(lineSegments, primitiveAttributeName, destAttribute);
				const srcArray = srcAttribute.array;
				const destArray = destAttribute.array;
				const srcArraySize = srcArray.length;
				let j = 0;
				for (let i = 0; i < srcArraySize; i++) {
					// 1 quad -> 4 lines
					destArray[j] = srcArray[i];
					destArray[j + 1] = srcArray[i];
					destArray[j + 2] = srcArray[i];
					destArray[j + 3] = srcArray[i];

					j += 4;
				}
			}
		}
	}

	prepareObject(lineSegments, {shadow: false});
	return lineSegments;
}

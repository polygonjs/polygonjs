import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {BufferAttribute, Mesh, Object3D, Vector3} from 'three';
import {isBooleanTrue} from '../../../core/Type';
import {
	adjacencyVertices,
	adjacencyGroupFaces,
	populateAdjacency2,
	AttribAdjacency,
	adjacencyAttribName,
} from '../../../core/geometry/operation/Adjacency';
// import {CoreGeometry} from '../../../core/geometry/Geometry';
import {CoreObject} from '../../../core/geometry/Object';
import {
	textureFromAttribLookupId,
	textureFromAttribLookupUv,
} from '../../../core/geometry/operation/TextureFromAttribute';

interface AdjacencySopParams extends DefaultOperationParams {
	applyToChildren: boolean;
	adjacencyCountName: string;
	adjacencyBaseName: string;
}

export class AdjacencySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AdjacencySopParams = {
		applyToChildren: true,
		adjacencyCountName: AttribAdjacency.COUNT,
		adjacencyBaseName: AttribAdjacency.BASE_NAME,
	};
	static override type(): Readonly<'adjacency'> {
		return 'adjacency';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AdjacencySopParams) {
		const coreGroup = inputCoreGroups[0];

		const objects = coreGroup.threejsObjects();
		for (let object of objects) {
			if (isBooleanTrue(params.applyToChildren)) {
				object.traverse((child) => {
					this._populateAdjacency(child, params);
				});
			} else {
				this._populateAdjacency(object, params);
			}
		}

		return coreGroup;
	}

	private _populateAdjacency(object: Object3D, params: AdjacencySopParams) {
		const geometry = (object as Mesh).geometry;
		if (!geometry) {
			return;
		}

		const position = geometry.attributes.position;
		if (!(position instanceof BufferAttribute)) {
			console.warn('position is not a BufferAttribute');
			return;
		}
		const index = geometry.index;
		if (!index) {
			console.warn('no index');
			return;
		}

		// populate vertices
		const vertices: Vector3[] = [];
		adjacencyVertices(geometry, vertices);

		// group faces

		const faces = adjacencyGroupFaces(geometry, vertices);
		if (!faces) {
			return;
		}

		// populate adjacency
		const adjacency = populateAdjacency2(faces, vertices);

		// build attributes
		let maxAdjacencyCount = -1;
		for (let arr of adjacency) {
			if (arr.length > maxAdjacencyCount) {
				maxAdjacencyCount = arr.length;
			}
		}
		const attribSize = 2;
		const attributesCount = Math.ceil(maxAdjacencyCount);

		// add object adjacency count
		CoreObject.addAttribute(object, params.adjacencyCountName, maxAdjacencyCount);

		const pointsCount = position.count;

		const _addAdjacencyAttributes = () => {
			for (let attribIndex = 0; attribIndex < attributesCount; attribIndex++) {
				const attribName = adjacencyAttribName(params.adjacencyBaseName, attribIndex);

				const values = new Array(pointsCount * attribSize).fill(-1);
				for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
					const pointAdjacency = adjacency[pointIndex][attribIndex];
					if (pointAdjacency) {
						for (let i = 0; i < attribSize; i++) {
							const value = pointAdjacency[i];
							values[pointIndex * attribSize + i] = value != null ? value : -1;
						}
					}
				}
				const valuesArray = new Float32Array(values);
				geometry.setAttribute(attribName, new BufferAttribute(valuesArray, attribSize));
			}
		};

		// const _addUv = () => {
		// 	textureFromAttributeSize(geometry, _textureSize);
		// 	const uvSize = 2;
		// 	const values = new Array(pointsCount * uvSize);

		// 	for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
		// 		_uv.x = pointIndex % _textureSize.x;
		// 		_uv.y = Math.floor(pointIndex / _textureSize.x);
		// 		_uv.addScalar(0.5);
		// 		_uv.divide(_textureSize);
		// 		_uv.toArray(values, pointIndex * uvSize);
		// 	}
		// 	const uvArray = new Float32Array(values);
		// 	geometry.setAttribute(AttribAdjacency.UV, new BufferAttribute(uvArray, attribSize));
		// };

		// const _addId = () => {
		// 	const idSize = 1;
		// 	const values = new Array(pointsCount * idSize);
		// 	for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
		// 		values[pointIndex] = pointIndex;
		// 	}
		// 	const idArray = new Float32Array(values);
		// 	geometry.setAttribute(AttribAdjacency.ID, new BufferAttribute(idArray, idSize));
		// };

		_addAdjacencyAttributes();
		textureFromAttribLookupUv(geometry);
		textureFromAttribLookupId(geometry);
	}
}

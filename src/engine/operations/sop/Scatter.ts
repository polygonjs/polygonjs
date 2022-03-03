import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {ObjectType} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Mesh} from 'three/src/objects/Mesh';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {Attribute} from '../../../core/geometry/Attribute';
import {MeshSurfaceSampler} from '../../../modules/core/math/MeshSurfaceSampler';
import {CoreMath} from '../../../core/math/_Module';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface ScatterSopParams extends DefaultOperationParams {
	pointsCount: number;
	seed: number;
	useWeightAttribute: boolean;
	weightAttribute: string;
	transferAttributes: boolean;
	attributesToTransfer: string;
	addIdAttribute: boolean;
	addIdnAttribute: boolean;
}
const tmpV2 = new Vector2();
const tmpV4 = new Vector4();

export class ScatterSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: ScatterSopParams = {
		pointsCount: 100,
		seed: 0,
		useWeightAttribute: false,
		weightAttribute: '',
		transferAttributes: false,
		attributesToTransfer: '',
		addIdAttribute: true,
		addIdnAttribute: true,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'scatter'> {
		return 'scatter';
	}

	private _position = new Vector3();
	private _normal = new Vector3();
	override async cook(inputContents: CoreGroup[], params: ScatterSopParams) {
		const coreGroup = inputContents[0];
		let inputMesh = coreGroup.objectsWithGeo()[0] as Mesh;
		const originalMesh = inputMesh;

		let inputGeometry = inputMesh.geometry;
		if (inputGeometry.index) {
			inputGeometry = inputGeometry.toNonIndexed();
			const newMesh = new Mesh(inputGeometry);
			inputMesh = newMesh;
		}

		const transferAttributes = params.transferAttributes;
		let attribNames: string[] = [];
		if (isBooleanTrue(transferAttributes)) {
			attribNames = coreGroup.attribNamesMatchingMask(params.attributesToTransfer);
		}

		const sampler = new MeshSurfaceSampler(inputMesh, attribNames);
		if (isBooleanTrue(params.useWeightAttribute)) {
			const weightAttributeName = params.weightAttribute.trim();
			if (weightAttributeName != '') {
				sampler.setWeightAttribute(weightAttributeName);
			}
		}
		const baseSeed = (2454 * params.seed) % Number.MAX_SAFE_INTEGER;
		sampler.setRandomGenerator((index: number) => {
			return CoreMath.randFloat(baseSeed, index);
		});
		sampler.build();

		const pointsCount = params.pointsCount;
		const positions: number[] = new Array(pointsCount * 3);
		const normals: number[] = new Array(pointsCount * 3);

		// additional attributes
		const additionalVectors: Vector3[] = new Array(attribNames.length);
		const additionalAttribSizes: number[] = new Array(attribNames.length);
		const additionalAttribSizeByName: Map<string, number> = new Map();
		const additionalAttribBuffers: number[][] = new Array(attribNames.length);
		const additionalAttribBuffersByName: Map<string, number[]> = new Map();
		for (let i = 0; i < attribNames.length; i++) {
			const attribName = attribNames[i];
			additionalVectors[i] = new Vector3();
			const attribSize = inputMesh.geometry.getAttribute(attribNames[i]).itemSize;
			additionalAttribSizeByName.set(attribName, attribSize);
			additionalAttribSizes[i] = attribSize;
			additionalAttribBuffers[i] = new Array(pointsCount * attribSize);
			additionalAttribBuffersByName.set(attribName, additionalAttribBuffers[i]);
		}
		const processAdditionalAttributes = attribNames.length > 0;

		const _position = this._position;
		const _normal = this._normal;
		let i3 = 0;
		for (let i = 0; i < pointsCount; i++) {
			sampler.sample(i, _position, _normal, additionalVectors);
			i3 = i * 3;
			_position.toArray(positions, i3);
			_normal.toArray(normals, i3);

			// additional attributes
			if (processAdditionalAttributes) {
				let j = 0;
				for (let additionalVector of additionalVectors) {
					const array = additionalAttribBuffers[j];
					const attribSize = additionalAttribSizes[j];
					const arrayIndex = i * attribSize;
					if (i < pointsCount - 1) {
						additionalVector.toArray(array, arrayIndex);
					} else {
						// when copying to the last point, we need to make sure not to use the vector3
						// if the attribsize is not 3, otherwise we end up increasing the size of the buffer
						if (attribSize == 3) {
							additionalVector.toArray(array, arrayIndex);
						} else {
							switch (attribSize) {
								case 1: {
									array[arrayIndex] = additionalVector.x;
									break;
								}
								case 2: {
									tmpV2.set(additionalVector.x, additionalVector.y);
									tmpV2.toArray(array, arrayIndex);
									break;
								}
								case 4: {
									tmpV4.set(additionalVector.x, additionalVector.y, additionalVector.z, 0);
									tmpV4.toArray(array, arrayIndex);
									break;
								}
							}
						}
					}
					j++;
				}
			}
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(positions), 3));
		geometry.setAttribute(Attribute.NORMAL, new BufferAttribute(new Float32Array(normals), 3));
		for (let attribName of attribNames) {
			const attribSize = additionalAttribSizeByName.get(attribName);
			const buffer = additionalAttribBuffersByName.get(attribName);
			if (attribSize != null && buffer != null) {
				geometry.setAttribute(attribName, new BufferAttribute(new Float32Array(buffer), attribSize));
			}
		}

		// add id
		if (isBooleanTrue(params.addIdAttribute) || isBooleanTrue(params.addIdnAttribute)) {
			const pointsCount = params.pointsCount;
			const ids = ArrayUtils.range(pointsCount);
			if (isBooleanTrue(params.addIdAttribute)) {
				geometry.setAttribute('id', new BufferAttribute(new Float32Array(ids), 1));
			}
			const idns = ids.map((id) => id / (pointsCount - 1));
			if (isBooleanTrue(params.addIdnAttribute)) {
				geometry.setAttribute('idn', new BufferAttribute(new Float32Array(idns), 1));
			}
		}

		const object = this.createObject(geometry, ObjectType.POINTS);
		object.position.copy(originalMesh.position);
		object.rotation.copy(originalMesh.rotation);
		object.scale.copy(originalMesh.scale);
		object.matrix.copy(originalMesh.matrix);
		return this.createCoreGroupFromObjects([object]);
	}
}

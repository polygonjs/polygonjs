import {BufferGeometry} from 'three';
import {BufferAttribute} from 'three';
import {InterleavedBufferAttribute} from 'three';
import {Triangle} from 'three';
import {Vector3} from 'three';
import {Mesh} from 'three';

/**
 * typescript port of https://github.com/mrdoob/three.js/blob/dev/examples/jsm/math/MeshSurfaceSampler.js
 */

const _face = new Triangle();
// const _color = new Vector3();

type RandomFuncWithoutSeed = () => number;
type RandomFuncWithSeed = (index: number) => number;
type RandomFunc = RandomFuncWithoutSeed | RandomFuncWithSeed;

export class MeshSurfaceSampler {
	private geometry: BufferGeometry;
	private randomFunction: RandomFunc = Math.random;
	private positionAttribute: BufferAttribute | InterleavedBufferAttribute;
	private additionalAttributes: Map<string, BufferAttribute | InterleavedBufferAttribute> = new Map();
	private weightAttribute: BufferAttribute | InterleavedBufferAttribute | null = null;
	private distribution: Float32Array | null = null;
	constructor(mesh: Mesh, private additionalAttributeNames: string[]) {
		let geometry = mesh.geometry;

		if (!geometry.isBufferGeometry || geometry.attributes.position.itemSize !== 3) {
			throw new Error('THREE.MeshSurfaceSampler: Requires BufferGeometry triangle mesh.');
		}

		if (geometry.index) {
			console.warn('THREE.MeshSurfaceSampler: Converting geometry to non-indexed BufferGeometry.');

			geometry = geometry.toNonIndexed();
		}

		this.geometry = geometry;

		this.positionAttribute = this.geometry.getAttribute('position');
		for (let attribName of additionalAttributeNames) {
			const attribute = this.geometry.getAttribute(attribName);
			if (attribute) {
				this.additionalAttributes.set(attribName, attribute);
			}
		}
	}

	setWeightAttribute(name: string) {
		this.weightAttribute = name ? this.geometry.getAttribute(name) : null;

		return this;
	}

	build() {
		const positionAttribute = this.positionAttribute;
		const weightAttribute = this.weightAttribute;

		const faceWeights = new Float32Array(positionAttribute.count / 3);

		// Accumulate weights for each mesh face.

		for (let i = 0; i < positionAttribute.count; i += 3) {
			let faceWeight = 1;

			if (weightAttribute) {
				faceWeight = weightAttribute.getX(i) + weightAttribute.getX(i + 1) + weightAttribute.getX(i + 2);
			}

			_face.a.fromBufferAttribute(positionAttribute, i);
			_face.b.fromBufferAttribute(positionAttribute, i + 1);
			_face.c.fromBufferAttribute(positionAttribute, i + 2);
			faceWeight *= _face.getArea();

			faceWeights[i / 3] = faceWeight;
		}

		// Store cumulative total face weights in an array, where weight index
		// corresponds to face index.

		this.distribution = new Float32Array(positionAttribute.count / 3);

		let cumulativeTotal = 0;

		for (let i = 0; i < faceWeights.length; i++) {
			cumulativeTotal += faceWeights[i];

			this.distribution[i] = cumulativeTotal;
		}

		return this;
	}

	setRandomGenerator(randomFunction: RandomFunc) {
		this.randomFunction = randomFunction;
		return this;
	}

	sample(index: number, targetPosition: Vector3, targetNormal: Vector3, targetAdditionalVectors?: Vector3[]) {
		const cumulativeTotal = this.distribution![this.distribution!.length - 1];
		const faceIndex = this.binarySearch(this.randomFunction(index) * cumulativeTotal);

		return this.sampleFace(index, faceIndex, targetPosition, targetNormal, targetAdditionalVectors);
	}

	binarySearch(x: number) {
		const dist = this.distribution!;
		let start = 0;
		let end = dist.length - 1;

		let index = -1;

		while (start <= end) {
			const mid = Math.ceil((start + end) / 2);

			if (mid === 0 || (dist[mid - 1] <= x && dist[mid] > x)) {
				index = mid;

				break;
			} else if (x < dist[mid]) {
				end = mid - 1;
			} else {
				start = mid + 1;
			}
		}

		return index;
	}

	sampleFace(
		i: number,
		faceIndex: number,
		targetPosition: Vector3,
		targetNormal: Vector3,
		targetAdditionalVectors?: Vector3[]
	) {
		let u = this.randomFunction(i * (faceIndex + 1456));
		let v = this.randomFunction((i + 9851) * (faceIndex + 7646));

		if (u + v > 1) {
			u = 1 - u;
			v = 1 - v;
		}

		_face.a.fromBufferAttribute(this.positionAttribute, faceIndex * 3);
		_face.b.fromBufferAttribute(this.positionAttribute, faceIndex * 3 + 1);
		_face.c.fromBufferAttribute(this.positionAttribute, faceIndex * 3 + 2);

		targetPosition
			.set(0, 0, 0)
			.addScaledVector(_face.a, u)
			.addScaledVector(_face.b, v)
			.addScaledVector(_face.c, 1 - (u + v));

		if (targetNormal !== undefined) {
			_face.getNormal(targetNormal);
		}

		if (targetAdditionalVectors) {
			let i = 0;
			for (let attribName of this.additionalAttributeNames) {
				const attrib = this.additionalAttributes.get(attribName);
				if (attrib) {
					_face.a.fromBufferAttribute(attrib, faceIndex * 3);
					_face.b.fromBufferAttribute(attrib, faceIndex * 3 + 1);
					_face.c.fromBufferAttribute(attrib, faceIndex * 3 + 2);
					const targetVector = targetAdditionalVectors[i];
					targetVector
						.set(0, 0, 0)
						.addScaledVector(_face.a, u)
						.addScaledVector(_face.b, v)
						.addScaledVector(_face.c, 1 - (u + v));
				}

				i++;
			}
		}

		return this;
	}
}

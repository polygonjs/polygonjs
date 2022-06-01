/**
 * Split the faces when the angle between their respective normals goes above a threshold
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BufferAttribute, BufferGeometry, InterleavedBufferAttribute, Triangle, Vector2, Vector3, Vector4} from 'three';
import {MapUtils} from '../../../core/MapUtils';
import {degToRad} from 'three/src/math/MathUtils';

const vector2 = new Vector2();
const vector3 = new Vector3();
const vector4 = new Vector4();

class FacetSopParamsConfig extends NodeParamsConfig {
	/** @param angle threshold to separate vertices */
	angle = ParamConfig.FLOAT(20, {
		range: [0, 90],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new FacetSopParamsConfig();

export class FacetSopNode extends TypedSopNode<FacetSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'facet';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to update normals of'];
	}
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		console.log('facet', this.pv.angle);
		const inputCoreGroup = inputCoreGroups[0];

		const objects = inputCoreGroup.objectsWithGeo();
		for (let object of objects) {
			this._applyCusp(object.geometry);
		}
		this.setObjects(objects);
	}
	private _applyCusp(geometry: BufferGeometry) {
		const indexAttrib = geometry.getIndex();
		if (!indexAttrib) {
			return;
		}

		const angleRad = degToRad(this.pv.angle);

		const position = geometry.getAttribute('position');
		const indexArray = indexAttrib.array;
		console.log('index original', indexArray);
		const pointsCount = indexArray.length;
		const faces: Face[] = [];
		const facesByPoint: Map<number, Set<Face>> = new Map();
		const facesById: Map<number, Face> = new Map();

		let faceId = 0;
		for (let i = 0; i < pointsCount; i += 3) {
			const face = new Face(faceId, indexArray[i], indexArray[i + 1], indexArray[i + 2], facesByPoint, position);
			facesById.set(faceId, face);
			faces.push(face);
			faceId++;
		}

		// assemble the face pairs
		const facePairId: Map<number, Set<number>> = new Map();
		for (let face of faces) {
			face.addPairs(facePairId);
			// const neighbours = face.neighbours();
			// for (let neighbour of neighbours) {
			// 	// we only need to add the face pair once,
			// 	// so we can simply test when face.id < neighbour.id,
			// 	// and add it then. And there is no need to add it again
			// 	// when this test is false
			// 	if(face.id < neighbour.id){
			// 		// const ids: Number2 = face.id < neighbour.id ? [face.id, neighbour.id] : [neighbour.id, face.id];
			// 		// console.log('add id', ids);
			// 		MapUtils.addToSetAtEntry(facePairId, face.id, neighbour.id);
			// 		console.log(facePairId);
			// 	}
			// }
		}
		const ejectByFace: Map<Face, FaceEject> = new Map();

		// go through each pair
		facePairId.forEach((set, id0) => {
			set.forEach((id1) => {
				const face0 = facesById.get(id0);
				const face1 = facesById.get(id1);
				if (!(face0 && face1)) {
					return;
				}
				const angle = face0.normal().angleTo(face1.normal());
				if (angle > angleRad) {
					console.log('angle above threshold', face0.id, face1.id);
					const pair = new FacePair(face0, face1);
					// const indices = pair.indicesInCommon();
					let eject = ejectByFace.get(face0);
					if (!eject) {
						eject = new FaceEject();
						ejectByFace.set(face0, eject);
					}
					eject.a = pair.inCommonA();
					eject.b = pair.inCommonB();
					eject.c = pair.inCommonC();
				}
			});
		});

		// create new vertices if needed
		const attributeNames = Object.keys(geometry.attributes);
		// const attributeNames = ['position'];
		// const newIndices = [...(indexArray as number[])];
		for (let attributeName of attributeNames) {
			const attribute = geometry.getAttribute(attributeName);
			console.log(attributeName);
			const isPosition = attributeName == 'position';
			if (attribute instanceof BufferAttribute) {
				const itemSize = attribute.itemSize;
				const newAttribValues = [...(attribute.array as number[])];
				function getVector() {
					if (itemSize == 2) {
						return vector2;
					}
					if (itemSize == 3) {
						return vector3;
					}
					if (itemSize == 4) {
						return vector4;
					}
				}
				ejectByFace.forEach((eject, face) => {
					const doEjects = [eject.a, eject.b, eject.c];
					const ptIndices = [face.a, face.b, face.c];
					console.log(face.id, doEjects, ptIndices);

					const vector = getVector();

					for (let i = 0; i <= 2; i++) {
						const doEject = doEjects[i];
						if (doEject) {
							const ptIndex = ptIndices[i];
							if (isPosition) {
								(indexArray as number[])[face.id * 3 + i] = newAttribValues.length / itemSize;
							}
							if (vector) {
								vector.fromBufferAttribute(attribute, ptIndex);
								vector.toArray(newAttribValues, newAttribValues.length);
							} else {
								const currentVal = attribute.array[ptIndex];
								newAttribValues.push(currentVal);
							}
						}
					}
				});
				geometry.setAttribute(attributeName, new BufferAttribute(new Float32Array(newAttribValues), itemSize));
			}
		}

		console.log('new index', indexArray);
		indexAttrib.needsUpdate = true;
		// geometry.setIndex(newIndices);
		geometry.computeVertexNormals();
	}
}

class Face {
	public readonly triangle = new Triangle();
	public readonly _normal = new Vector3();
	constructor(
		public readonly id: number,
		public readonly a: number,
		public readonly b: number,
		public readonly c: number,
		public readonly facesByPoint: Map<number, Set<Face>>,
		position: BufferAttribute | InterleavedBufferAttribute
	) {
		MapUtils.addToSetAtEntry(facesByPoint, a, this);
		MapUtils.addToSetAtEntry(facesByPoint, b, this);
		MapUtils.addToSetAtEntry(facesByPoint, c, this);

		this.triangle.a.fromBufferAttribute(position, a);
		this.triangle.b.fromBufferAttribute(position, b);
		this.triangle.c.fromBufferAttribute(position, c);
		this.triangle.getNormal(this._normal);
	}
	static indicesInCommon(face0: Face, face1: Face) {}
	normal() {
		return this._normal;
	}
	addPairs(facePairId: Map<number, Set<number>>) {
		const facesA = this.facesByPoint.get(this.a);
		const facesB = this.facesByPoint.get(this.b);
		const facesC = this.facesByPoint.get(this.c);
		const faceGroups = [facesA, facesB, facesC];

		for (let faceGroup of faceGroups) {
			if (faceGroup) {
				faceGroup.forEach((face) => {
					// only add the pair if the current id is less than the other face id
					// (since this order will always happen, no need to add when it is the other order)
					if (this.id < face.id) {
						if (FacePair.pointsCountInCommon(this, face) >= 2) {
							console.log(
								'face ids:',
								this.id,
								face.id,
								'in common',
								FacePair.pointsCountInCommon(this, face)
							);
							MapUtils.addToSetAtEntry(facePairId, this.id, face.id);
						}
					}
				});
			}
		}

		// const emptyFacesSet: Set<Face> = new Set();
		// const facesA = this.facesByPoint.get(this.a) || emptyFacesSet;
		// const facesB = this.facesByPoint.get(this.b) || emptyFacesSet;
		// const facesC = this.facesByPoint.get(this.c) || emptyFacesSet;
		// const facesUsedByAB = setIntersection(facesA, facesB);
		// const facesUsedByBC = setIntersection(facesB, facesC);
		// const facesUsedByCA = setIntersection(facesC, facesA);
		// const facesWith2orMoreVertexInCommon = setsUnion([facesUsedByAB, facesUsedByBC, facesUsedByCA]);
		// const neighbours: Face[] = [];
		// facesWith2orMoreVertexInCommon.forEach((face) => {
		// 	if (face.id != this.id) {
		// 		neighbours.push(face);
		// 	}
		// });
		// return neighbours;
		// console.log(this.id, otherFaces, this.normal);
	}
}

class FacePair {
	public readonly _indicesInCommon: number[] = [];
	public _inCommonA: boolean = false;
	public _inCommonB: boolean = false;
	public _inCommonC: boolean = false;
	constructor(public readonly face0: Face, public readonly face1: Face) {
		if (face0.a == face1.a || face0.a == face1.b || face0.a == face1.c) {
			this._indicesInCommon.push(face0.a);
			this._inCommonA = true;
		}
		if (face0.b == face1.a || face0.b == face1.b || face0.b == face1.c) {
			this._indicesInCommon.push(face0.b);
			this._inCommonB = true;
		}
		if (face0.c == face1.a || face0.c == face1.b || face0.c == face1.c) {
			this._indicesInCommon.push(face0.c);
			this._inCommonC = true;
		}
	}
	inCommonA() {
		return this._inCommonA;
	}
	inCommonB() {
		return this._inCommonB;
	}
	inCommonC() {
		return this._inCommonC;
	}
	static pointsCountInCommon(face0: Face, face1: Face) {
		let i = 0;
		if (face0.a == face1.a || face0.a == face1.b || face0.a == face1.c) {
			i++;
		}
		if (face0.b == face1.a || face0.b == face1.b || face0.b == face1.c) {
			i++;
		}
		if (face0.c == face1.a || face0.c == face1.b || face0.c == face1.c) {
			i++;
		}
		return i;
	}
	indicesInCommon() {
		return this._indicesInCommon;
	}
}
class FaceEject {
	public a: boolean = false;
	public b: boolean = false;
	public c: boolean = false;
}

// function setIntersection<T extends Face>(set0: Set<T>, set1: Set<T>): Set<T> {
// 	const newSet: Set<T> = new Set();
// 	set0.forEach((val) => {
// 		if (set1.has(val)) {
// 			newSet.add(val);
// 		}
// 	});
// 	set1.forEach((val) => {
// 		if (set0.has(val)) {
// 			newSet.add(val);
// 		}
// 	});
// 	return newSet;
// }
// function setsUnion<T extends Face>(sets: Set<T>[]): Set<T> {
// 	const newSet: Set<T> = new Set();
// 	for (let set of sets) {
// 		set.forEach((val) => newSet.add(val));
// 	}
// 	return newSet;
// }

import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DefaultOperationParams} from '../_Base';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {ObjectType} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
// import {CoreIterator} from '../../../core/Iterator';
// import {CoreMath} from '../../../core/math/_Module';
// import {CoreType} from '../../../core/Type';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Mesh} from 'three/src/objects/Mesh';
import {Vector3} from 'three/src/math/Vector3';
import {Attribute} from '../../../core/geometry/Attribute';
// import {MeshSurfaceSampler} from '../../../modules/three/examples/jsm/math/MeshSurfaceSampler';
import {MeshSurfaceSampler} from '../../../modules/core/math/MeshSurfaceSampler';
import {CoreMath} from '../../../core/math/_Module';
// import {CoreString} from '../../../core/String';

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

export class ScatterSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ScatterSopParams = {
		pointsCount: 100,
		seed: 0,
		useWeightAttribute: false,
		weightAttribute: '',
		transferAttributes: false,
		attributesToTransfer: '',
		addIdAttribute: true,
		addIdnAttribute: true,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'scatter'> {
		return 'scatter';
	}

	private _position = new Vector3();
	private _normal = new Vector3();
	async cook(inputContents: CoreGroup[], params: ScatterSopParams) {
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
			return CoreMath.randFloat(baseSeed + index);
		});
		sampler.build();

		const pointsCount = params.pointsCount;
		const positions: number[] = new Array(pointsCount * 3);
		const normals: number[] = new Array(pointsCount * 3);

		// additional attributes
		const additionalVectors: Vector3[] = new Array(attribNames.length);
		const additionalAttribSizes: number[] = new Array(attribNames.length);
		const additionalAttribSizeByName: Dictionary<number> = {};
		const additionalAttribBuffers: number[][] = new Array(attribNames.length);
		const additionalAttribBuffersByName: Dictionary<number[]> = {};
		for (let i = 0; i < attribNames.length; i++) {
			const attribName = attribNames[i];
			additionalVectors[i] = new Vector3();
			const attribSize = inputMesh.geometry.getAttribute(attribNames[i]).itemSize;
			additionalAttribSizeByName[attribName] = attribSize;
			additionalAttribSizes[i] = attribSize;
			additionalAttribBuffers[i] = new Array(pointsCount * attribSize);
			additionalAttribBuffersByName[attribName] = additionalAttribBuffers[i];
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
					additionalVector.toArray(additionalAttribBuffers[j], i * additionalAttribSizes[j]);
					j++;
				}
			}
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(positions), 3));
		geometry.setAttribute(Attribute.NORMAL, new BufferAttribute(new Float32Array(normals), 3));
		for (let attribName of attribNames) {
			geometry.setAttribute(
				attribName,
				new BufferAttribute(
					new Float32Array(additionalAttribBuffersByName[attribName]),
					additionalAttribSizeByName[attribName]
				)
			);
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

	// async cookOLD(inputContents: CoreGroup[], params: ScatterSopParams) {
	// 	const coreGroup = inputContents[0];
	// 	let faces = coreGroup.faces();
	// 	const areasThresholds: number[] = [];
	// 	let areaSum = 0;
	// 	const areaByFaceIndex: Map<number, number> = new Map();

	// 	for (let face of faces) {
	// 		const area = face.area();
	// 		areaByFaceIndex.set(face.index(), area);
	// 	}
	// 	const sortedFaces = ArrayUtils.sortBy(faces, (f) => {
	// 		return areaByFaceIndex.get(f.index()) || -1;
	// 	});

	// 	let i = 0;
	// 	for (let face of sortedFaces) {
	// 		areaSum += areaByFaceIndex.get(face.index()) as number;
	// 		areasThresholds[i] = areaSum;
	// 		i++;
	// 	}

	// 	const positions: number[] = [];
	// 	let attribNames: string[] = [];
	// 	if (isBooleanTrue(params.transferAttributes)) {
	// 		attribNames = coreGroup.attribNamesMatchingMask(params.attributesToTransfer);
	// 	}

	// 	const attribValuesByName: Map<string, number[]> = new Map();
	// 	const attribSizesByName: Map<string, number> = new Map();
	// 	for (let attrib_name of attribNames) {
	// 		attribValuesByName.set(attrib_name, []);
	// 		attribSizesByName.set(attrib_name, coreGroup.attribSize(attrib_name));
	// 	}

	// 	const iterator = new CoreIterator();
	// 	const baseSeed = (2454 * params.seed) % Number.MAX_SAFE_INTEGER;
	// 	await iterator.startWithCount(params.pointsCount, (point_index: number) => {
	// 		const rand = CoreMath.randFloat(baseSeed + point_index) * areaSum;

	// 		for (let face_index = 0; face_index < areasThresholds.length; face_index++) {
	// 			const areasThreshold = areasThresholds[face_index];

	// 			if (rand <= areasThreshold) {
	// 				const face = sortedFaces[face_index];
	// 				const position = face.randomPosition(rand);
	// 				position.toArray(positions, positions.length);

	// 				for (let attribName of attribNames) {
	// 					const attribValue = face.attribValueAtPosition(attribName, position);
	// 					if (attribValue != null) {
	// 						if (CoreType.isNumber(attribValue)) {
	// 							attribValuesByName.get(attribName)!.push(attribValue);
	// 						} else {
	// 							if (CoreType.isVector(attribValue)) {
	// 								attribValue.toArray(
	// 									attribValuesByName.get(attribName),
	// 									attribValuesByName.get(attribName)!.length
	// 								);
	// 							}
	// 						}
	// 					}
	// 				}

	// 				break;
	// 			}
	// 		}
	// 	});

	// 	// for(let point_index=0; point_index<params.pointsCount; point_index++){

	// 	// 	const rand = CoreMath.rand_float(params.seed+point_index) * area_sum

	// 	// 	for(let face_index=0; face_index<areas_thresholds.length; face_index++){

	// 	// 		const areas_threshold = areas_thresholds[face_index]

	// 	// 		if(rand <= areas_threshold){
	// 	// 			const face = sorted_faces[face_index]
	// 	// 			const position = face.random_position(rand)
	// 	// 			position.toArray(positions, positions.length)

	// 	// 			for(let attrib_name of attrib_names){
	// 	// 				const attrib_value = face.attrib_value_at_position(attrib_name, position)
	// 	// 				if (CoreType.isNumber(attrib_value)){
	// 	// 					attrib_values_by_name[attrib_name].push(attrib_value)
	// 	// 				} else {
	// 	// 					attrib_value.toArray(
	// 	// 						attrib_values_by_name[attrib_name],
	// 	// 						attrib_values_by_name[attrib_name].length
	// 	// 					)
	// 	// 				}
	// 	// 			}

	// 	// 			break;
	// 	// 		}
	// 	// 	}
	// 	// }

	// 	const geometry = new BufferGeometry();
	// 	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	// 	for (let attribName of attribNames) {
	// 		geometry.setAttribute(
	// 			attribName,
	// 			new BufferAttribute(
	// 				new Float32Array(attribValuesByName.get(attribName)!),
	// 				attribSizesByName.get(attribName)!
	// 			)
	// 		);
	// 	}

	// 	// if (isBooleanTrue(params.addIdAttribute) || isBooleanTrue(params.addIdnAttribute)) {
	// 	// 	const pointsCount = params.pointsCount;
	// 	// 	const ids = ArrayUtils.range(pointsCount);
	// 	// 	if (isBooleanTrue(params.addIdAttribute)) {
	// 	// 		geometry.setAttribute('id', new BufferAttribute(new Float32Array(ids), 1));
	// 	// 	}
	// 	// 	const idns = ids.map((id) => id / (pointsCount - 1));
	// 	// 	if (isBooleanTrue(params.addIdnAttribute)) {
	// 	// 		geometry.setAttribute('idn', new BufferAttribute(new Float32Array(idns), 1));
	// 	// 	}
	// 	// }

	// 	const object = this.createObject(geometry, ObjectType.POINTS);

	// 	return this.createCoreGroupFromObjects([object]);
	// }
}

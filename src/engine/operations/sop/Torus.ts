import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {CoreTransform} from '../../../core/Transform';
import {isBooleanTrue} from '../../../core/Type';
import {Attribute} from '../../../core/geometry/Attribute';
import {Vector3, Triangle, BufferGeometry, Float32BufferAttribute} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface TorusSopParams extends DefaultOperationParams {
	radius: number;
	radiusTube: number;
	segmentsRadial: number;
	segmentsTube: number;
	open: boolean;
	arc: number;
	cap: boolean;
	direction: Vector3;
	center: Vector3;
}
const DEFAULT_UP = new Vector3(0, 0, 1);
const capPositionsCenter0 = new Vector3();
const capCenter0 = new Vector3();
const tmpPos0 = new Vector3();
const tmpPos1 = new Vector3();
const tmpN = new Vector3();
const triangle = new Triangle();
const center = new Vector3();
const position = new Vector3();
const normal = new Vector3();

export class TorusSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: TorusSopParams = {
		radius: 1,
		radiusTube: 0.25,
		segmentsRadial: 20,
		segmentsTube: 50,
		open: false,
		arc: Math.PI * 2,
		cap: true,
		direction: new Vector3(0, 1, 0),
		center: new Vector3(0, 0, 0),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'torus'> {
		return 'torus';
	}

	override cook(input_contents: CoreGroup[], params: TorusSopParams) {
		const arc = isBooleanTrue(params.open) ? params.arc : Math.PI * 2;
		const cap: boolean = isBooleanTrue(params.open) ? params.cap : false;

		const radialSegments = Math.floor(params.segmentsRadial);
		const tubularSegments = Math.floor(params.segmentsTube);
		const {radius, radiusTube} = params;

		// buffers

		const indices: number[] = [];
		const positions: number[] = [];
		const normals: number[] = [];
		const uvs: number[] = [];

		// generate positions, normals and uvs
		const capIndices0: number[] = [];
		const capIndices1: number[] = [];

		function setPosition(i: number, j: number, position: Vector3) {
			const u = (i / tubularSegments) * arc;
			const v = (j / radialSegments) * Math.PI * 2;

			// vertex

			position.x = (radius + radiusTube * Math.cos(v)) * Math.cos(u);
			position.y = (radius + radiusTube * Math.cos(v)) * Math.sin(u);
			position.z = radiusTube * Math.sin(v);
			return {u, v};
		}

		for (let j = 0; j <= radialSegments; j++) {
			for (let i = 0; i <= tubularSegments; i++) {
				const {u} = setPosition(i, j, position);

				positions.push(position.x, position.y, position.z);
				// if (cap) {
				// 	if (i == 0) {
				// 		capIndices0.push(positions.length / 3 - 1);
				// 	} else if (i == tubularSegments) {
				// 		capIndices1.push(positions.length / 3 - 1);
				// 	}
				// }

				// normal

				center.x = radius * Math.cos(u);
				center.y = radius * Math.sin(u);
				normal.subVectors(position, center).normalize();

				normals.push(normal.x, normal.y, normal.z);

				// uv

				uvs.push(i / tubularSegments);
				uvs.push(j / radialSegments);
			}
		}
		if (cap) {
			let i = 0;
			for (let j = 0; j <= radialSegments; j++) {
				setPosition(i, j, position);
				positions.push(position.x, position.y, position.z);
				// normal is pushed here to correctly set the length of the array
				// but will be overriden in _addCap
				normals.push(-1, -1, -1);
				capIndices0.push(positions.length / 3 - 1);
			}
			i = tubularSegments;
			for (let j = 0; j <= radialSegments; j++) {
				setPosition(i, j, position);
				positions.push(position.x, position.y, position.z);
				normals.push(-1, -1, -1);
				capIndices1.push(positions.length / 3 - 1);
			}
		}

		// generate indices

		for (let j = 1; j <= radialSegments; j++) {
			for (let i = 1; i <= tubularSegments; i++) {
				// indices

				const a = (tubularSegments + 1) * j + i - 1;
				const b = (tubularSegments + 1) * (j - 1) + i - 1;
				const c = (tubularSegments + 1) * (j - 1) + i;
				const d = (tubularSegments + 1) * j + i;

				// faces

				indices.push(a, b, d);
				indices.push(b, c, d);
			}
		}

		if (cap) {
			this._addCap(capIndices0, positions, normals, indices, false);
			this._addCap(capIndices1, positions, normals, indices, true);
		}

		// build geometry
		const geometry = new BufferGeometry();
		geometry.setIndex(indices);
		geometry.setAttribute(Attribute.POSITION, new Float32BufferAttribute(positions, 3));
		geometry.setAttribute(Attribute.NORMAL, new Float32BufferAttribute(normals, 3));
		geometry.setAttribute(Attribute.UV, new Float32BufferAttribute(uvs, 2));

		geometry.translate(params.center.x, params.center.y, params.center.z);
		CoreTransform.rotateGeometry(geometry, DEFAULT_UP, params.direction);

		return this.createCoreGroupFromGeometry(geometry);
	}

	private _addCap(capIndices: number[], positions: number[], normals: number[], indices: number[], invert: boolean) {
		const capPointsCount = capIndices.length;
		if (capPointsCount <= 2) {
			return;
		}
		capCenter0.set(0, 0, 0);
		for (let i = 0; i < capPointsCount; i++) {
			capPositionsCenter0.fromArray(positions, capIndices[i] * 3);
			capCenter0.add(capPositionsCenter0);
		}
		capCenter0.divideScalar(capIndices.length);
		positions.push(capCenter0.x, capCenter0.y, capCenter0.z);
		const centerIndex = positions.length / 3 - 1;

		tmpPos0.fromArray(positions, capIndices[0] * 3);
		tmpPos1.fromArray(positions, capIndices[1] * 3);
		triangle.a.copy(tmpPos0);
		triangle.b.copy(tmpPos1);
		triangle.c.copy(capCenter0);
		triangle.getNormal(tmpN);

		if (invert) {
			tmpN.multiplyScalar(-1);
		}
		normals.push(tmpN.x, tmpN.y, tmpN.z);

		for (let i = 0; i < capIndices.length - 1; i++) {
			const a = centerIndex;
			const b = capIndices[i];
			const c = capIndices[i + 1];
			if (invert) {
				indices.push(c, b, a);
			} else {
				indices.push(a, b, c);
			}
			tmpN.toArray(normals, 3 * b);
		}
	}
}

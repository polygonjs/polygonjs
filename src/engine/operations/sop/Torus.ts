import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {CoreTransform} from '../../../core/Transform';
import {isBooleanTrue} from '../../../core/Type';
import {Attribute} from '../../../core/geometry/Attribute';
import {Triangle} from 'three/src/math/Triangle';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';

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
const vertex = new Vector3();
const normal = new Vector3();

export class TorusSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: TorusSopParams = {
		radius: 1,
		radiusTube: 1,
		segmentsRadial: 20,
		segmentsTube: 12,
		open: false,
		arc: Math.PI * 2,
		cap: true,
		direction: new Vector3(0, 1, 0),
		center: new Vector3(0, 0, 0),
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'torus'> {
		return 'torus';
	}

	private _core_transform = new CoreTransform();
	cook(input_contents: CoreGroup[], params: TorusSopParams) {
		const arc = isBooleanTrue(params.open) ? params.arc : Math.PI * 2;
		const cap = isBooleanTrue(params.open) ? params.cap : false;

		const radialSegments = Math.floor(params.segmentsRadial);
		const tubularSegments = Math.floor(params.segmentsTube);
		const {radius, radiusTube} = params;

		// buffers

		const indices: number[] = [];
		const vertices: number[] = [];
		const normals: number[] = [];
		const uvs: number[] = [];

		// generate vertices, normals and uvs
		const capIndices0: number[] = [];
		const capIndices1: number[] = [];

		for (let j = 0; j <= radialSegments; j++) {
			for (let i = 0; i <= tubularSegments; i++) {
				const u = (i / tubularSegments) * arc;
				const v = (j / radialSegments) * Math.PI * 2;

				// vertex

				vertex.x = (radius + radiusTube * Math.cos(v)) * Math.cos(u);
				vertex.y = (radius + radiusTube * Math.cos(v)) * Math.sin(u);
				vertex.z = radiusTube * Math.sin(v);

				vertices.push(vertex.x, vertex.y, vertex.z);
				if (cap) {
					if (i == 0) {
						capIndices0.push(vertices.length / 3 - 1);
					} else if (i == tubularSegments) {
						capIndices1.push(vertices.length / 3 - 1);
					}
				}

				// normal

				center.x = radius * Math.cos(u);
				center.y = radius * Math.sin(u);
				normal.subVectors(vertex, center).normalize();

				normals.push(normal.x, normal.y, normal.z);

				// uv

				uvs.push(i / tubularSegments);
				uvs.push(j / radialSegments);
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
			this._addCap(capIndices0, vertices, normals, indices, false);
			this._addCap(capIndices1, vertices, normals, indices, true);
		}

		// build geometry
		const geometry = new BufferGeometry();
		geometry.setIndex(indices);
		geometry.setAttribute(Attribute.POSITION, new Float32BufferAttribute(vertices, 3));
		geometry.setAttribute(Attribute.NORMAL, new Float32BufferAttribute(normals, 3));
		geometry.setAttribute(Attribute.UV, new Float32BufferAttribute(uvs, 2));

		if (0) {
			geometry.translate(params.center.x, params.center.y, params.center.z);
			this._core_transform.rotateGeometry(geometry, DEFAULT_UP, params.direction);
		}

		return this.createCoreGroupFromGeometry(geometry);
	}

	private _addCap(capIndices: number[], vertices: number[], normals: number[], indices: number[], invert: boolean) {
		const capPointsCount = capIndices.length;
		if (capPointsCount <= 2) {
			return;
		}
		capCenter0.set(0, 0, 0);
		for (let i = 0; i < capPointsCount; i++) {
			capPositionsCenter0.fromArray(vertices, capIndices[i] * 3);
			capCenter0.add(capPositionsCenter0);
		}
		capCenter0.divideScalar(capIndices.length);
		vertices.push(capCenter0.x, capCenter0.y, capCenter0.z);
		const centerIndex = vertices.length / 3 - 1;

		tmpPos0.fromArray(vertices, capIndices[0] * 3);
		tmpPos1.fromArray(vertices, capIndices[1] * 3);
		triangle.a.copy(tmpPos0);
		triangle.b.copy(tmpPos1);
		triangle.c.copy(capCenter0);
		tmpN.set(0, 0, 0);
		triangle.getNormal(tmpN);
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
		}
	}
}

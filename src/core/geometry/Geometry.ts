import {
	ColorLike,
	NumericAttribValue,
	PolyDictionary,
	Vector2Like,
	Vector3Like,
	Vector4Like,
} from '../../types/GlobalTypes';
import {
	Box3,
	BufferGeometry,
	Float32BufferAttribute,
	BufferAttribute,
	Vector3,
	Int32BufferAttribute,
	InstancedBufferAttribute,
} from 'three';
import {CorePoint} from './Point';
// import {CoreFace} from './CoreFace';
import {AttribType, AttribSize} from './Constant';
import {Attribute, CoreAttribute} from './Attribute';
import {CoreAttributeData} from './AttributeData';
import {CoreType} from '../Type';
import {ArrayUtils} from '../ArrayUtils';
import {ObjectUtils} from '../ObjectUtils';
import {GroupString} from './Group';
import {InstanceAttrib} from './Instancer';
import {CorePrimitive} from './Primitive';
import {CoreVertex} from './Vertex';

const IS_INSTANCE_KEY = 'isInstance';
const INDEX_ATTRIB_VALUES = 'indexedAttribValues';

const normalsComputedWithPositionAttributeVersion: Map<string, number> = new Map();

export class CoreGeometry {
	_bounding_box: Box3 | undefined;

	constructor(private _geometry: BufferGeometry) {}
	dispose() {}

	geometry() {
		return this._geometry;
	}
	uuid() {
		return this._geometry.uuid;
	}

	boundingBox() {
		return (this._bounding_box = this._bounding_box || this._create_bounding_box());
	}
	private _create_bounding_box() {
		this._geometry.computeBoundingBox();
		if (this._geometry.boundingBox) {
			return this._geometry.boundingBox;
		}
	}

	markAsInstance() {
		this._geometry.userData[IS_INSTANCE_KEY] = true;
	}
	static markedAsInstance(geometry: BufferGeometry): boolean {
		return geometry.userData[IS_INSTANCE_KEY] === true;
	}
	markedAsInstance(): boolean {
		return CoreGeometry.markedAsInstance(this._geometry);
	}
	positionAttribName() {
		return CoreGeometry.positionAttribName(this._geometry);
	}
	static positionAttribName(geometry: BufferGeometry) {
		return this.markedAsInstance(geometry) ? InstanceAttrib.POSITION : Attribute.POSITION;
	}
	static computeVertexNormals(geometry?: BufferGeometry) {
		if (!geometry) {
			return;
		}
		geometry.computeVertexNormals();
	}
	static computeVertexNormalsIfAttributeVersionChanged(geometry?: BufferGeometry) {
		if (!geometry) {
			return;
		}
		const positionAttribute = geometry.getAttribute(Attribute.POSITION);
		if (!positionAttribute) {
			return;
		}
		if (!(positionAttribute instanceof BufferAttribute)) {
			return;
		}
		let lastVersion = normalsComputedWithPositionAttributeVersion.get(geometry.uuid);
		if (lastVersion == null || lastVersion != positionAttribute.version) {
			geometry.computeVertexNormals();
			normalsComputedWithPositionAttributeVersion.set(geometry.uuid, positionAttribute.version);
		}
	}
	computeVertexNormals() {
		CoreGeometry.computeVertexNormals(this._geometry);
	}
	static userDataAttribs(geometry: BufferGeometry) {
		return (geometry.userData[INDEX_ATTRIB_VALUES] = geometry.userData[INDEX_ATTRIB_VALUES] || {});
	}
	userDataAttribs() {
		return CoreGeometry.userDataAttribs(this._geometry);
	}
	indexedAttributeNames() {
		return Object.keys(this.userDataAttribs() || {});
	}
	static userDataAttrib(geometry: BufferGeometry, attribName: string) {
		attribName = CoreAttribute.remapName(attribName);
		return this.userDataAttribs(geometry)[attribName];
	}
	userDataAttrib(name: string) {
		name = CoreAttribute.remapName(name);
		return this.userDataAttribs()[name];
	}
	static isAttribIndexed(geometry: BufferGeometry, attribName: string): boolean {
		attribName = CoreAttribute.remapName(attribName);
		return this.userDataAttrib(geometry, attribName) != null;
	}
	isAttribIndexed(name: string): boolean {
		name = CoreAttribute.remapName(name);
		return this.userDataAttrib(name) != null;
	}

	static hasAttrib(geometry: BufferGeometry, attribName: string): boolean {
		if (attribName === Attribute.POINT_INDEX) {
			return true;
		}
		attribName = CoreAttribute.remapName(attribName);
		return geometry.attributes[attribName] != null;
	}
	hasAttrib(attribName: string): boolean {
		return CoreGeometry.hasAttrib(this._geometry, attribName);
	}
	markAttribAsNeedsUpdate(attribName: string) {
		attribName = CoreAttribute.remapName(attribName);
		const attrib = this._geometry.attributes[attribName];
		if (attrib) {
			attrib.needsUpdate = true;
		}
	}
	attribType(name: string) {
		if (this.isAttribIndexed(name)) {
			return AttribType.STRING;
		} else {
			return AttribType.NUMERIC;
		}
	}

	static attribNames(geometry: BufferGeometry): string[] {
		return Object.keys(geometry.attributes);
	}
	attribNames(): string[] {
		return CoreGeometry.attribNames(this._geometry);
	}
	static attribNamesMatchingMask(geometry: BufferGeometry, masksString: GroupString) {
		return CoreAttribute.attribNamesMatchingMask(masksString, this.attribNames(geometry));
	}
	attribNamesMatchingMask(masksString: GroupString) {
		return CoreGeometry.attribNamesMatchingMask(this._geometry, masksString);
	}

	attribSizes(): PolyDictionary<AttribSize> {
		const h: PolyDictionary<AttribSize> = {};
		for (let attrib_name of this.attribNames()) {
			h[attrib_name] = this._geometry.attributes[attrib_name].itemSize;
		}
		return h;
	}
	static attribSize(geometry: BufferGeometry, attribName: string): number {
		// let attrib;
		attribName = CoreAttribute.remapName(attribName);
		const attrib = geometry.attributes[attribName];
		if (attrib) {
			return attrib.itemSize;
		} else {
			if (attribName === Attribute.POINT_INDEX) {
				// to ensure attrib copy with ptnum as source works
				return 1;
			} else {
				return 0;
			}
		}
	}
	attribSize(attribName: string): number {
		return CoreGeometry.attribSize(this._geometry, attribName);
		// let attrib;
		// name = CoreAttribute.remapName(name);
		// if ((attrib = this._geometry.attributes[name]) != null) {
		// 	return attrib.itemSize;
		// } else {
		// 	if (name === Attribute.POINT_INDEX) {
		// 		// to ensure attrib copy with ptnum as source works
		// 		return 1;
		// 	} else {
		// 		return 0;
		// 	}
		// }
	}

	setIndexedAttributeValues(name: string, values: string[]) {
		this.userDataAttribs()[name] = values;
	}

	setIndexedAttribute(name: string, values: string[], indices: number[]) {
		this.setIndexedAttributeValues(name, values);
		this._geometry.setAttribute(name, new Int32BufferAttribute(indices, 1));
		this._geometry.getAttribute(name).needsUpdate = true;
	}

	addNumericAttrib(name: string, size: number = 1, default_value: NumericAttribValue = 0) {
		const values = [];

		let attributeAdded = false;
		if (CoreType.isNumber(default_value)) {
			// adding number
			for (let i = 0; i < this.pointsCount(); i++) {
				for (let j = 0; j < size; j++) {
					values.push(default_value);
				}
			}
			attributeAdded = true;
		} else {
			if (size > 1) {
				if (CoreType.isArray(default_value)) {
					// adding array
					for (let i = 0; i < this.pointsCount(); i++) {
						for (let j = 0; j < size; j++) {
							values.push(default_value[j]);
						}
					}
					attributeAdded = true;
				} else {
					// adding Vector2
					const vec2 = default_value as Vector2Like;
					if (size == 2 && vec2.x != null && vec2.y != null) {
						for (let i = 0; i < this.pointsCount(); i++) {
							values.push(vec2.x);
							values.push(vec2.y);
						}
						attributeAdded = true;
					}
					// adding Vector3
					const vec3 = default_value as Vector3Like;
					if (size == 3 && vec3.x != null && vec3.y != null && vec3.z != null) {
						for (let i = 0; i < this.pointsCount(); i++) {
							values.push(vec3.x);
							values.push(vec3.y);
							values.push(vec3.z);
						}
						attributeAdded = true;
					}
					// adding Color
					const col = default_value as ColorLike;
					if (size == 3 && col.r != null && col.g != null && col.b != null) {
						for (let i = 0; i < this.pointsCount(); i++) {
							values.push(col.r);
							values.push(col.g);
							values.push(col.b);
						}
						attributeAdded = true;
					}
					// adding Vector4
					const vec4 = default_value as Vector4Like;
					if (size == 4 && vec4.x != null && vec4.y != null && vec4.z != null && vec4.w != null) {
						for (let i = 0; i < this.pointsCount(); i++) {
							values.push(vec4.x);
							values.push(vec4.y);
							values.push(vec4.z);
							values.push(vec4.w);
						}
						attributeAdded = true;
					}
				}
			}
		}

		if (attributeAdded) {
			if (this.markedAsInstance()) {
				const valuesAsTypedArray = new Float32Array(values);
				this._geometry.setAttribute(name.trim(), new InstancedBufferAttribute(valuesAsTypedArray, size));
			} else {
				this._geometry.setAttribute(name.trim(), new Float32BufferAttribute(values, size));
			}
		} else {
			console.warn(default_value);
			throw `CoreGeometry.add_numeric_attrib error: no other default value allowed for now in add_numeric_attrib (default given: ${default_value})`;
		}
	}

	initPositionAttribute(points_count: number, default_value?: Vector3) {
		const values = [];
		if (default_value == null) {
			default_value = new Vector3();
		}

		for (let i = 0; i < points_count; i++) {
			values.push(default_value.x);
			values.push(default_value.y);
			values.push(default_value.z);
		}

		return this._geometry.setAttribute('position', new Float32BufferAttribute(values, 3));
	}

	addAttribute(name: string, attrib_data: CoreAttributeData) {
		switch (attrib_data.type()) {
			case AttribType.STRING:
				return console.log('TODO: to implement');
			case AttribType.NUMERIC:
				return this.addNumericAttrib(name, attrib_data.size());
		}
	}

	renameAttrib(old_name: string, new_name: string) {
		if (this.isAttribIndexed(old_name)) {
			this.userDataAttribs()[new_name] = ObjectUtils.clone(this.userDataAttribs()[old_name]);
			delete this.userDataAttribs()[old_name];
		}

		const old_attrib = this._geometry.getAttribute(old_name) as BufferAttribute;
		this._geometry.setAttribute(new_name.trim(), new Float32BufferAttribute(old_attrib.array, old_attrib.itemSize));
		return this._geometry.deleteAttribute(old_name);
	}

	deleteAttribute(name: string) {
		if (this.isAttribIndexed(name)) {
			delete this.userDataAttribs()[name];
		}

		return this._geometry.deleteAttribute(name);
	}

	clone(): BufferGeometry {
		return CoreGeometry.clone(this._geometry);
	}

	static clone(srcGeometry: BufferGeometry): BufferGeometry {
		const clonedGeometry = srcGeometry.clone();
		if (srcGeometry.userData) {
			clonedGeometry.userData = ObjectUtils.cloneDeep(srcGeometry.userData);
		}
		return clonedGeometry;
	}

	pointsCount(): number {
		return CoreGeometry.pointsCount(this._geometry);
	}

	static pointsCount(geometry: BufferGeometry): number {
		let count = 0;
		const core_geometry = new this(geometry);
		let position_attrib_name = 'position';
		if (core_geometry.markedAsInstance()) {
			position_attrib_name = 'instancePosition';
		}

		const position = geometry.getAttribute(position_attrib_name) as BufferAttribute | undefined;
		if (position) {
			let array;
			if ((array = position.array) != null) {
				count = array.length / 3;
			}
		}

		return count;
	}
	//
	//
	// POINTS
	//
	//
	points(): CorePoint[] {
		// do not cache, as this gives unexpected results
		// when the points are updated internaly
		return this.pointsFromGeometry();
	}
	static points(geometry: BufferGeometry): CorePoint[] {
		return CoreGeometry.pointsFromGeometry(geometry);
	}
	pointsFromGeometry(): CorePoint[] {
		return CoreGeometry.pointsFromGeometry(this._geometry);
	}
	static pointsFromGeometry(geometry: BufferGeometry): CorePoint[] {
		const points: CorePoint[] = [];
		const positionAttrib = geometry.getAttribute(this.positionAttribName(geometry)) as BufferAttribute;

		if (positionAttrib != null) {
			const count = positionAttrib.array.length / 3;
			for (let i = 0; i < count; i++) {
				const point = new CorePoint(geometry, i);

				points.push(point);
			}
		}

		return points;
	}
	//
	//
	// VERTICES
	//
	//
	vertices(): CoreVertex[] {
		// do not cache, as this gives unexpected results
		// when the points are updated internaly
		return this.verticesFromGeometry();
	}
	static vertices(geometry: BufferGeometry): CoreVertex[] {
		return CoreGeometry.verticesFromGeometry(geometry);
	}
	verticesFromGeometry(): CoreVertex[] {
		return CoreGeometry.verticesFromGeometry(this._geometry);
	}
	static verticesFromGeometry(geometry: BufferGeometry): CoreVertex[] {
		const vertices: CoreVertex[] = [];

		const count = CoreVertex.verticesCount(geometry);
		for (let i = 0; i < count; i++) {
			const vertex = new CoreVertex(geometry, i);
			vertices.push(vertex);
		}

		return vertices;
	}
	static vertexAttributeNames(geometry: BufferGeometry): string[] {
		const attributes = CoreVertex.attributes(geometry);
		if (!attributes) {
			return [];
		}
		return Object.keys(attributes);
	}
	static vertexAttributeSizes(geometry: BufferGeometry): PolyDictionary<AttribSize> {
		const attributes = CoreVertex.attributes(geometry);
		if (!attributes) {
			return {};
		}
		const attribNames = Object.keys(attributes);
		const h: PolyDictionary<AttribSize> = {};
		for (const attribName of attribNames) {
			h[attribName] = attributes[attribName].itemSize;
		}
		return h;
	}
	static vertexAttributeTypes(geometry: BufferGeometry): PolyDictionary<AttribType> {
		const attributes = CoreVertex.attributes(geometry);
		if (!attributes) {
			return {};
		}
		const attribNames = Object.keys(attributes);
		const h: PolyDictionary<AttribType> = {};
		for (const attribName of attribNames) {
			h[attribName] = attributes[attribName].isString() ? AttribType.STRING : AttribType.NUMERIC;
		}
		return h;
	}
	//
	//
	// PRIMITIVES
	//
	//
	primitives(): CorePrimitive[] {
		// do not cache, as this gives unexpected results
		// when the points are updated internaly
		return this.primitivesFromGeometry();
	}
	static primitives(geometry: BufferGeometry): CorePrimitive[] {
		return CoreGeometry.primitivesFromGeometry(geometry);
	}
	primitivesFromGeometry(): CorePrimitive[] {
		return CoreGeometry.primitivesFromGeometry(this._geometry);
	}
	static primitivesFromGeometry(geometry: BufferGeometry): CorePrimitive[] {
		const primitives: CorePrimitive[] = [];

		const count = CorePrimitive.primitivesCount(geometry);
		for (let i = 0; i < count; i++) {
			const primitive = new CorePrimitive(geometry, i);

			primitives.push(primitive);
		}

		return primitives;
	}
	static primitiveAttributeNames(geometry: BufferGeometry): string[] {
		const attributes = CorePrimitive.attributes(geometry);
		if (!attributes) {
			return [];
		}
		return Object.keys(attributes);
	}
	static primitiveAttributeSizes(geometry: BufferGeometry): PolyDictionary<AttribSize> {
		const attributes = CorePrimitive.attributes(geometry);
		if (!attributes) {
			return {};
		}
		const attribNames = Object.keys(attributes);
		const h: PolyDictionary<AttribSize> = {};
		for (const attribName of attribNames) {
			h[attribName] = attributes[attribName].itemSize;
		}
		return h;
	}
	static primitiveAttributeTypes(geometry: BufferGeometry): PolyDictionary<AttribType> {
		const attributes = CorePrimitive.attributes(geometry);
		if (!attributes) {
			return {};
		}
		const attribNames = Object.keys(attributes);
		const h: PolyDictionary<AttribType> = {};
		for (const attribName of attribNames) {
			h[attribName] = attributes[attribName].isString() ? AttribType.STRING : AttribType.NUMERIC;
		}
		return h;
	}

	//
	//
	//
	//
	//
	segments() {
		const index: Array<number> = (this.geometry().index?.array || []) as Array<number>;
		return ArrayUtils.chunk(index, 2);
	}

	// faces(): CoreFace[] {
	// 	return this.facesFromGeometry();
	// }
	facesCount(): number {
		const indexArray = this.geometry().index?.array || [];
		const facesCount = indexArray.length / 3;
		return facesCount;
	}
	// facesFromGeometry(): CoreFace[] {
	// 	return ArrayUtils.range(faces_count).map((i) => new CoreFace(this, i));
	// }
}

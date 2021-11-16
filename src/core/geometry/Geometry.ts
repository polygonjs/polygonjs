import {
	ColorLike,
	NumericAttribValue,
	PolyDictionary,
	Vector2Like,
	Vector3Like,
	Vector4Like,
} from '../../types/GlobalTypes';
import {Vector3} from 'three/src/math/Vector3';
import {Int32BufferAttribute} from 'three/src/core/BufferAttribute';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Box3} from 'three/src/math/Box3';
import {CorePoint} from './Point';
import {CoreFace} from './Face';
import {ObjectType, AttribType, AttribSize} from './Constant';
import {CoreAttribute} from './Attribute';
import {CoreAttributeData} from './AttributeData';
import {CoreGeometryBuilderPoints} from './builders/Points';
import {CoreGeometryBuilderMerge} from './builders/Merge';
import {CoreGeometryBuilderMesh} from './builders/Mesh';
import {CoreGeometryBuilderLineSegments} from './builders/LineSegments';
import {TypeAssert} from '../../engine/poly/Assert';
import {CoreType} from '../Type';
import {ArrayUtils} from '../ArrayUtils';
import {ObjectUtils} from '../ObjectUtils';
import {CoreString} from '../String';
import {GroupString} from './Group';

const IS_INSTANCE_KEY = 'isInstance';
const INDEX_ATTRIB_VALUES = 'indexed_attrib_values';

export class CoreGeometry {
	_bounding_box: Box3 | undefined;

	constructor(private _geometry: BufferGeometry) {}

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
		let name = 'position';
		if (this.markedAsInstance()) {
			name = 'instancePosition';
		}
		return name;
	}

	computeVertexNormals() {
		this._geometry.computeVertexNormals();
	}

	userDataAttribs() {
		return (this._geometry.userData[INDEX_ATTRIB_VALUES] = this._geometry.userData[INDEX_ATTRIB_VALUES] || {});
	}
	indexedAttributeNames() {
		return Object.keys(this.userDataAttribs() || {});
	}
	userDataAttrib(name: string) {
		name = CoreAttribute.remapName(name);
		return this.userDataAttribs()[name];
	}
	isAttribIndexed(name: string): boolean {
		name = CoreAttribute.remapName(name);
		return this.userDataAttrib(name) != null;
	}

	hasAttrib(name: string): boolean {
		if (name === 'ptnum') {
			return true;
		}
		name = CoreAttribute.remapName(name);
		return this._geometry.attributes[name] != null;
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
	static attribNamesMatchingMask(geometry: BufferGeometry, masks_string: GroupString) {
		const masks = CoreString.attribNames(masks_string);

		const matching_attrib_names: string[] = [];
		for (let attrib_name of this.attribNames(geometry)) {
			for (let mask of masks) {
				if (CoreString.matchMask(attrib_name, mask)) {
					matching_attrib_names.push(attrib_name);
				}
			}
		}

		return ArrayUtils.uniq(matching_attrib_names);
	}

	attribSizes() {
		const h: PolyDictionary<AttribSize> = {};
		for (let attrib_name of this.attribNames()) {
			h[attrib_name] = this._geometry.attributes[attrib_name].itemSize;
		}
		return h;
	}
	attribSize(name: string): number {
		let attrib;
		name = CoreAttribute.remapName(name);
		if ((attrib = this._geometry.attributes[name]) != null) {
			return attrib.itemSize;
		} else {
			if (name === 'ptnum') {
				// to ensure attrib copy with ptnum as source works
				return 1;
			} else {
				return 0;
			}
		}
	}

	setIndexedAttributeValues(name: string, values: string[]) {
		this.userDataAttribs()[name] = values;
	}

	setIndexedAttribute(name: string, values: string[], indices: number[]) {
		this.setIndexedAttributeValues(name, values);
		this._geometry.setAttribute(name, new Int32BufferAttribute(indices, 1));
	}

	addNumericAttrib(name: string, size: number = 1, default_value: NumericAttribValue = 0) {
		const values = [];

		let attribute_added = false;
		if (CoreType.isNumber(default_value)) {
			// adding number
			for (let i = 0; i < this.pointsCount(); i++) {
				for (let j = 0; j < size; j++) {
					values.push(default_value);
				}
			}
			attribute_added = true;
		} else {
			if (size > 1) {
				if (CoreType.isArray(default_value)) {
					// adding array
					for (let i = 0; i < this.pointsCount(); i++) {
						for (let j = 0; j < size; j++) {
							values.push(default_value[j]);
						}
					}
					attribute_added = true;
				} else {
					// adding Vector2
					const vec2 = default_value as Vector2Like;
					if (size == 2 && vec2.x != null && vec2.y != null) {
						for (let i = 0; i < this.pointsCount(); i++) {
							values.push(vec2.x);
							values.push(vec2.y);
						}
						attribute_added = true;
					}
					// adding Vector3
					const vec3 = default_value as Vector3Like;
					if (size == 3 && vec3.x != null && vec3.y != null && vec3.z != null) {
						for (let i = 0; i < this.pointsCount(); i++) {
							values.push(vec3.x);
							values.push(vec3.y);
							values.push(vec3.z);
						}
						attribute_added = true;
					}
					// adding Color
					const col = default_value as ColorLike;
					if (size == 3 && col.r != null && col.g != null && col.b != null) {
						for (let i = 0; i < this.pointsCount(); i++) {
							values.push(col.r);
							values.push(col.g);
							values.push(col.b);
						}
						attribute_added = true;
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
						attribute_added = true;
					}
				}
			}
		}

		if (attribute_added) {
			this._geometry.setAttribute(name.trim(), new Float32BufferAttribute(values, size));
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

		const old_attrib = this._geometry.getAttribute(old_name);
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

	static clone(src_geometry: BufferGeometry): BufferGeometry {
		let src_userData;

		// monkey path
		// for (let attribute_name of Object.keys(src_geometry.attributes)) {
		// 	const attribute = src_geometry.getAttribute(attribute_name);
		// 	if (attribute.constructor.name == InterleavedBufferAttribute.name) {
		// 		MonkeyPatcher.patch(attribute as InterleavedBufferAttribute);
		// 	}
		// }

		const new_geometry = src_geometry.clone();
		if ((src_userData = src_geometry.userData) != null) {
			new_geometry.userData = ObjectUtils.cloneDeep(src_userData);
		}
		return new_geometry;
	}

	pointsCount(): number {
		return CoreGeometry.pointsCount(this._geometry);
	}

	static pointsCount(geometry: BufferGeometry): number {
		let position;
		let count = 0;
		const core_geometry = new this(geometry);
		let position_attrib_name = 'position';
		if (core_geometry.markedAsInstance()) {
			position_attrib_name = 'instancePosition';
		}

		if ((position = geometry.getAttribute(position_attrib_name)) != null) {
			let array;
			if ((array = position.array) != null) {
				count = array.length / 3;
			}
		}

		return count;
	}

	points(): CorePoint[] {
		// do not cache, as this gives unexpected results
		// when the points are updated internaly
		return this.pointsFromGeometry();
	}
	pointsFromGeometry(): CorePoint[] {
		const points = [];
		const positionAttrib = this._geometry.getAttribute(this.positionAttribName());

		if (positionAttrib != null) {
			const count = positionAttrib.array.length / 3;
			for (let i = 0; i < count; i++) {
				const point = new CorePoint(this, i);

				points.push(point);
			}
		}

		return points;
	}

	private static _mesh_builder = new CoreGeometryBuilderMesh();
	private static _points_builder = new CoreGeometryBuilderPoints();
	private static _lines_segment_builder = new CoreGeometryBuilderLineSegments();
	static geometryFromPoints(points: CorePoint[], object_type: ObjectType) {
		switch (object_type) {
			case ObjectType.MESH:
				return this._mesh_builder.from_points(points);
			case ObjectType.POINTS:
				return this._points_builder.from_points(points);
			case ObjectType.LINE_SEGMENTS:
				return this._lines_segment_builder.from_points(points);
			case ObjectType.OBJECT3D:
				return null;
			case ObjectType.GROUP:
				return null;
			case ObjectType.LOD:
				return null;
		}
		TypeAssert.unreachable(object_type);
	}

	static mergeGeometries(geometries: BufferGeometry[]) {
		return CoreGeometryBuilderMerge.merge(geometries);
	}
	// legacy helper
	static merge_geometries(geometries: BufferGeometry[]) {
		return CoreGeometryBuilderMerge.merge(geometries);
	}

	segments() {
		const index: Array<number> = (this.geometry().index?.array || []) as Array<number>;
		return ArrayUtils.chunk(index, 2);
	}

	faces(): CoreFace[] {
		return this.facesFromGeometry();
	}
	facesFromGeometry(): CoreFace[] {
		const index_array = this.geometry().index?.array || [];
		const faces_count = index_array.length / 3;
		return ArrayUtils.range(faces_count).map((i) => new CoreFace(this, i));
	}
}

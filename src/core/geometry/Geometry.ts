import {Vector3} from 'three/src/math/Vector3';
import {Int32BufferAttribute} from 'three/src/core/BufferAttribute';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Box3} from 'three/src/math/Box3';
import {InterleavedBufferAttribute} from 'three/src/core/InterleavedBufferAttribute';
import lodash_range from 'lodash/range';
import lodash_chunk from 'lodash/chunk';
import lodash_cloneDeep from 'lodash/cloneDeep';
import lodash_clone from 'lodash/clone';
import lodash_isArray from 'lodash/isArray';
import lodash_isNumber from 'lodash/isNumber';
import {CorePoint} from './Point';
import {CoreFace} from './Face';
import {ObjectType, AttribType, AttribSize} from './Constant';
import {CoreAttribute} from './Attribute';
import {MonkeyPatcher} from './MonkeyPatcher';
import {CoreAttributeData} from './AttributeData';
import {CoreGeometryBuilderPoints} from './builders/Points';
import {CoreGeometryBuilderMerge} from './builders/Merge';
import {CoreGeometryBuilderMesh} from './builders/Mesh';
import {CoreGeometryBuilderLineSegments} from './builders/LineSegments';
import {TypeAssert} from '../../engine/poly/Assert';

export class CoreGeometry {
	_bounding_box: Box3 | undefined;
	private _points: CorePoint[] | undefined;

	// @INDEX_MODE_POINTS = 'INDEX_MODE_POINTS'
	// @INDEX_MODE_FACES = 'INDEX_MODE_FACES'
	// @INDEX_MODE_LINES = 'INDEX_MODE_LINES'

	constructor(private _geometry: BufferGeometry) {}
	//

	geometry() {
		return this._geometry;
	}
	uuid() {
		return this._geometry.uuid;
	}

	bounding_box() {
		return (this._bounding_box = this._bounding_box || this._create_bounding_box());
	}
	_create_bounding_box() {
		this._geometry.computeBoundingBox();
		if (this._geometry.boundingBox) {
			return this._geometry.boundingBox;
		}
	}

	mark_as_instance() {
		this._geometry.userData['is_instance'] = true;
	}
	static marked_as_instance(geometry: BufferGeometry): boolean {
		return geometry.userData['is_instance'] === true;
	}
	marked_as_instance(): boolean {
		return CoreGeometry.marked_as_instance(this._geometry);
	}
	position_attrib_name() {
		let name = 'position';
		if (this.marked_as_instance()) {
			name = 'instancePosition';
		}
		return name;
	}

	compute_vertex_normals() {
		this._geometry.computeVertexNormals();
	}

	user_data_attribs() {
		const key = 'indexed_attrib_values';
		return (this._geometry.userData[key] = this._geometry.userData[key] || {});
	}
	indexed_attribute_names() {
		return Object.keys(this.user_data_attribs() || {});
	}
	user_data_attrib(name: string) {
		name = CoreAttribute.remap_name(name);
		return this.user_data_attribs()[name];
	}
	is_attrib_indexed(name: string): boolean {
		name = CoreAttribute.remap_name(name);
		return this.user_data_attrib(name) != null;
	}

	has_attrib(name: string): boolean {
		if (name === 'ptnum') {
			return true;
		}
		name = CoreAttribute.remap_name(name);
		return this._geometry.attributes[name] != null;
	}
	attrib_type(name: string) {
		if (this.is_attrib_indexed(name)) {
			return AttribType.STRING;
		} else {
			return AttribType.NUMERIC;
		}
	}

	attrib_names(): string[] {
		return Object.keys(this._geometry.attributes);
	}
	attrib_sizes() {
		const h: Dictionary<AttribSize> = {};
		for (let attrib_name of this.attrib_names()) {
			h[attrib_name] = this._geometry.attributes[attrib_name].itemSize;
		}
		return h;
	}
	attrib_size(name: string): number {
		let attrib;
		name = CoreAttribute.remap_name(name);
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

	set_indexed_attribute_values(name: string, values: string[]) {
		this.user_data_attribs()[name] = values;
	}

	set_indexed_attribute(name: string, values: string[], indices: number[]) {
		this.set_indexed_attribute_values(name, values);
		this._geometry.setAttribute(name, new Int32BufferAttribute(indices, 1));
	}

	add_numeric_attrib(name: string, size: number = 1, default_value: NumericAttribValue = 0) {
		const values = [];

		let attribute_added = false;
		if (lodash_isNumber(default_value)) {
			// adding number
			for (let i = 0; i < this.points_count(); i++) {
				for (let j = 0; j < size; j++) {
					values.push(default_value);
				}
			}
			attribute_added = true;
		} else {
			if (size > 1) {
				if (lodash_isArray(default_value)) {
					// adding array
					for (let i = 0; i < this.points_count(); i++) {
						for (let j = 0; j < size; j++) {
							values.push(default_value[j]);
						}
					}
					attribute_added = true;
				} else {
					// adding Vector2
					const vec2 = default_value as Vector2Like;
					if (size == 2 && vec2.x != null && vec2.y != null) {
						for (let i = 0; i < this.points_count(); i++) {
							values.push(vec2.x);
							values.push(vec2.y);
						}
						attribute_added = true;
					}
					// adding Vector3
					const vec3 = default_value as Vector3Like;
					if (size == 3 && vec3.x != null && vec3.y != null && vec3.z != null) {
						for (let i = 0; i < this.points_count(); i++) {
							values.push(vec3.x);
							values.push(vec3.y);
							values.push(vec3.z);
						}
						attribute_added = true;
					}
					// adding Color
					const col = default_value as ColorLike;
					if (size == 3 && col.r != null && col.g != null && col.b != null) {
						for (let i = 0; i < this.points_count(); i++) {
							values.push(col.r);
							values.push(col.g);
							values.push(col.b);
						}
						attribute_added = true;
					}
					// adding Vector4
					const vec4 = default_value as Vector4Like;
					if (size == 4 && vec4.x != null && vec4.y != null && vec4.z != null && vec4.w != null) {
						for (let i = 0; i < this.points_count(); i++) {
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
			this._geometry.setAttribute(name, new Float32BufferAttribute(values, size));
		} else {
			throw 'no other default value allowed for now in add_numeric_attrib';
		}
	}

	init_position_attribute(points_count: number, default_value?: Vector3) {
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

	add_attribute(name: string, attrib_data: CoreAttributeData) {
		switch (attrib_data.type()) {
			case AttribType.STRING:
				return console.log('TODO: to implement');
			case AttribType.NUMERIC:
				return this.add_numeric_attrib(name, attrib_data.size());
		}
	}

	rename_attribute(old_name: string, new_name: string) {
		if (this.is_attrib_indexed(old_name)) {
			this.user_data_attribs()[new_name] = lodash_clone(this.user_data_attribs()[old_name]);
			delete this.user_data_attribs()[old_name];
		}

		const old_attrib = this._geometry.getAttribute(old_name);
		this._geometry.setAttribute(new_name, new Float32BufferAttribute(old_attrib.array, old_attrib.itemSize));
		return this._geometry.deleteAttribute(old_name);
	}

	delete_attribute(name: string) {
		if (this.is_attrib_indexed(name)) {
			delete this.user_data_attribs()[name];
		}

		return this._geometry.deleteAttribute(name);
	}

	clone(): BufferGeometry {
		return CoreGeometry.clone(this._geometry);
	}

	static clone(src_geometry: BufferGeometry): BufferGeometry {
		let src_userData;

		// monkey path
		for (let attribute_name of Object.keys(src_geometry.attributes)) {
			const attribute = src_geometry.getAttribute(attribute_name);
			if (attribute.constructor.name == InterleavedBufferAttribute.name) {
				MonkeyPatcher.patch(attribute as InterleavedBufferAttribute);
			}
		}

		const new_geometry = src_geometry.clone();
		if ((src_userData = src_geometry.userData) != null) {
			new_geometry.userData = lodash_cloneDeep(src_userData);
		}
		return new_geometry;
	}

	points_count(): number {
		return CoreGeometry.points_count(this._geometry);
	}

	static points_count(geometry: BufferGeometry): number {
		let position;
		let count = 0;
		const core_geometry = new this(geometry);
		let position_attrib_name = 'position';
		if (core_geometry.marked_as_instance()) {
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

	// TODO: use lodash_chunk
	// like: lodash_chunk(template_geometry.getAttribute('position').array, 3)
	points(): CorePoint[] {
		return (this._points = this._points || this.points_from_geometry());
	}
	reset_points() {
		this._points = undefined;
	}
	points_from_geometry(): CorePoint[] {
		const points = [];
		const position_attrib = this._geometry.getAttribute(this.position_attrib_name());

		if (position_attrib != null) {
			const points_count = position_attrib.array.length / 3;
			for (let point_index = 0; point_index < points_count; point_index++) {
				const point = new CorePoint(this, point_index);

				// lodash_each lodash_keys(@_geometry.attributes), (attrib_name) =>

				// 	attribute = @_geometry.getAttribute(attrib_name)
				// 	item_size = attribute.itemSize
				// 	current_index = point_index  *item_size

				// 	attrib_value = switch item_size
				// 		when 1
				// 			attribute.array[current_index]
				// 		when 2
				// 			new Vector2(
				// 				attribute.array[current_index + 0]
				// 				attribute.array[current_index + 1]
				// 				)
				// 		when 3
				// 			new Vector3(
				// 				attribute.array[current_index + 0]
				// 				attribute.array[current_index + 1]
				// 				attribute.array[current_index + 2]
				// 				)

				// 	point.add_attribute(attrib_name, item_size, attrib_value)

				points.push(point);
			}
		}

		return points;
	}

	private static _mesh_builder = new CoreGeometryBuilderMesh();
	private static _points_builder = new CoreGeometryBuilderPoints();
	private static _lines_segment_builder = new CoreGeometryBuilderLineSegments();
	static geometry_from_points(points: CorePoint[], object_type: ObjectType) {
		switch (object_type) {
			case ObjectType.MESH:
				return this._mesh_builder.from_points(points);
			case ObjectType.POINTS:
				return this._points_builder.from_points(points);
			case ObjectType.LINE_SEGMENTS:
				return this._lines_segment_builder.from_points(points);
			case ObjectType.OBJECT3D:
				return null;
		}
		TypeAssert.unreachable(object_type);
	}

	static merge_geometries(geometries: BufferGeometry[]) {
		return CoreGeometryBuilderMerge.merge(geometries);
	}

	segments() {
		// const points = this.points();
		const index = this.geometry().index?.array || [];
		return lodash_chunk(index, 2);
	}

	faces(): CoreFace[] {
		return this.faces_from_geometry();
	}
	faces_from_geometry(): CoreFace[] {
		const index_array = this.geometry().index?.array || [];
		const faces_count = index_array.length / 3;
		return lodash_range(faces_count).map((i) => new CoreFace(this, i));
	}
}

// segments_count = 0.5*index.length
// segments = []
// lodash_times segments_count, (i)->
// 	indices = [i, i+1]
// 	segments.push(indices) #lodash_map(indices, (index)->points[index])

// segments

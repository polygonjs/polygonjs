import {Vector3} from 'three/src/math/Vector3';
// import {Object3D} from 'three/src/core/Object3D'
// import {Group} from 'three/src/objects/Group'
import {Mesh} from 'three/src/objects/Mesh';
import {Box3} from 'three/src/math/Box3';
import {TypedContainer} from './_Base';
import {CoreGroup} from 'src/core/geometry/Group';
// import {CoreObject} from 'src/core/geometry/Object'
import {CoreGeometry} from 'src/core/geometry/Geometry';
import {BufferGeometry} from 'three';
// import {CoreConstant} from 'src/core/geometry/Constant'

// const CoreGeometryGroup = CoreGroup

// export type RequestContainerGeometryCallback = (container: Geometry)=>void

// interface GroupOptions {
// 	clone?: boolean
// }
// interface BooleanByString {
// 	[propName: string]: boolean
// }
export class GeometryContainer extends TypedContainer<CoreGroup> {
	// protected _group: Group = new Group()
	// private _objects_by_uuid: BooleanByString = {}
	// protected _content: Object3D[] = []
	protected _core_group: CoreGroup;

	_points_count: number;
	_bounding_box: Box3;

	constructor() {
		super();
		// this._materials = [];
	}

	// _post_set_content(){
	// 	this._core_group = this._core_group || new CoreGroup()
	// 	this._core_group.touch()
	// 	this._core_group.set_objects(this._content)
	// }

	// clone_content(){
	// 	return this._content.map(object=>CoreObject.clone(object))
	// }
	core_content(): CoreGroup {
		return this._core_group;
	}
	core_content_cloned(): CoreGroup {
		if (this._core_group) {
			return this._core_group.clone();
		}
	}
	reset_caches() {
		this._core_group = null;
		this._points_count = null;
		this._bounding_box = null;
	}
	_default_content() {
		return new CoreGroup();
	}

	// set_geometry: (geometry)->
	// 	if @_content?
	// 		@_content.dispose()
	// 	this.set_content(geometry)
	// has_group: ->
	// 	this.has_content()
	// group(options?: GroupOptions): Group | null{
	// 	let src_group;
	// 	if (options == null) { options = {}; }
	// 	if ((options['clone'] == null)) {
	// 		options['clone'] = true;
	// 	}

	// 	let new_group = null;
	// 	if ((src_group = this.content()) != null) {
	// 		if (options['clone'] === true) {
	// 			new_group = CoreGroup.clone(src_group);
	// 		} else {
	// 			new_group = src_group;
	// 		}
	// 	}

	// 	return new_group;
	// }

	// group_wrapper(options){
	// 	// if (options == null) { options = {}; }
	// 	// return new CoreGroup(this.group(options));
	// }
	core_group() {
		return this._core_group; //this.group_wrapper(options)
	}

	// object(options){
	// 	if (options == null) { options = {}; }
	// 	return this.group(options);
	// }
	// _post_set_content(){
	// 	// const objects_to_remove = []
	// 	// const objects_to_add = []
	// 	// const new_objects_by_uuid = {}
	// 	// for(let object of this._content){
	// 	// 	if(!this._objects_by_uuid[object.uuid]){
	// 	// 		objects_to_add.push(object)
	// 	// 	}
	// 	// 	new_objects_by_uuid[object.uuid] = true
	// 	// }
	// 	// for(let uuid of Object.keys(this._objects_by_uuid)){

	// 	// }
	// 	let child
	// 	while(child = this._group.children[0]){
	// 		this._group.remove(child)
	// 	}
	// 	for(let object of this._content){
	// 		this._group.add(object)
	// 	}
	// }

	//
	//
	// INFOS
	//
	//
	// infos() {
	// 	if (this._content != null) {
	// 		const bbox = this.bounding_box();
	// 		const center = this.center(); //bbox.min.clone().add(bbox.max).multiplyScalar(0.5)
	// 		const size = this.size(); //bbox.max.clone().sub(bbox.min)

	// 		const node = this.node();
	// 		const part_1 = [
	// 			`time dependent: ${node.is_time_dependent()}`,
	// 			`${node.cooks_count()} cooks`,
	// 			`cook time: ${node.cook_time()}`,
	// 			`cook time with inputs: ${node.cook_time_with_inputs()}`,
	// 			`${this.points_count()} points`,
	// 			`${this.objects_count()} object(s)  (${this.objects_visible_count()} visible)`
	// 		];

	// 		const part_2 = [];
	// 		const count_by_type = this.objects_count_by_type();
	// 		Object.keys(count_by_type).forEach((type)=>{

	// 			const count = count_by_type[type];
	// 			return part_2.push(`${count} ${type}`);
	// 		});

	// 		const vertex_attributes = this.vertex_attribute_names();
	// 		const object_attributes = this.object_attribute_names();
	// 		part_2.push(`vertex attributes (${vertex_attributes.length}): ${vertex_attributes.join(', ')}`);
	// 		part_2.push(`object attributes (${object_attributes.length}): ${object_attributes.join(', ')}`);

	// 		const part_3 = [
	// 			"bbox:",
	// 			[bbox.min.x, bbox.min.y, bbox.min.z],
	// 			[bbox.max.x, bbox.max.y, bbox.max.z],
	// 			"center:",
	// 			[center.x, center.y, center.z],
	// 			"size:",
	// 			[size.x, size.y, size.z],
	// 			this._content
	// 		];

	// 		return lodash_concat( part_1, part_2, part_3 );
	// 	}
	// }

	private first_object() {
		if (this._content) {
			return this._content.objects()[0];
		}
	}
	private first_geometry(): BufferGeometry {
		const object = this.first_object();
		if (object) {
			return (object as Mesh).geometry as BufferGeometry;
		}
	}

	objects_count(): number {
		// let count = 0
		// if(this._content){
		// 	count = this._content.children.length
		// }
		// return count
		if (this._content) {
			return this._content.objects().length;
		} else {
			return 0;
		}
	}
	objects_visible_count(): number {
		let count = 0;
		if (this._content) {
			count = this._content.objects().filter((c) => c.visible).length; // lodash_filter(this._content, c=> c.visible).length;
		}
		return count;
	}
	objects_count_by_type() {
		const count_by_type: NumbersByString = {};
		if (this._content) {
			for (let core_object of this.core_group().core_objects()) {
				const human_type = core_object.human_type();
				if (count_by_type[human_type] == null) {
					count_by_type[human_type] = 0;
				}
				count_by_type[human_type] += 1;
			}
		}
		return count_by_type;
	}
	objects_names_by_type() {
		const names_by_type: StringsArrayByString = {};
		if (this._content) {
			for (let core_object of this.core_group().core_objects()) {
				const human_type = core_object.human_type();
				names_by_type[human_type] = names_by_type[human_type] || [];
				names_by_type[human_type].push(core_object.name());
			}
		}
		return names_by_type;
	}

	vertex_attribute_names() {
		let names: string[] = [];
		const geometry = this.first_geometry();
		if (geometry) {
			names = Object.keys(geometry.attributes);
		}
		return names;
	}
	vertex_attribute_sizes_by_name() {
		let sizes_by_name: NumbersByString = {};
		const geometry = this.first_geometry();
		if (geometry) {
			Object.keys(geometry.attributes).forEach((attrib_name) => {
				const attrib = geometry.attributes[attrib_name];
				sizes_by_name[attrib_name] = attrib.itemSize;
			});
		}
		return sizes_by_name;
	}
	vertex_attribute_types_by_name() {
		let types_by_name: NumbersByString = {};
		const geometry = this.first_geometry();
		if (geometry) {
			const core_geo = new CoreGeometry(geometry);
			Object.keys(geometry.attributes).forEach((attrib_name) => {
				types_by_name[attrib_name] = core_geo.attrib_type(attrib_name);
			});
		}
		return types_by_name;
	}
	object_attribute_names() {
		let names: string[] = [];
		const object = this.first_object();
		if (object) {
			names = Object.keys(object.userData['attributes'] || {});
		}
		return names;
	}

	points_count() {
		return this._points_count != null ? this._points_count : (this._points_count = this._compute_points_count());
	}

	_compute_points_count() {
		let points_count = 0;
		if (this._content) {
			for (let object of this._content.objects()) {
				object.traverse((object) => {
					const geometry = (object as Mesh).geometry as BufferGeometry;
					if (geometry) {
						points_count += CoreGeometry.points_count(geometry);
					}
				});
			}
		}
		return points_count;
	}
	//@_content.userData['points_count']
	//Core.Geometry.Geometry.points_count(@_content)
	// count = 0
	// if (position = @_content.getAttribute('position'))?
	// 	if (array = position.array)?
	// 		count = array.length / 3

	// count

	// points_for_geometry: (geometry)->
	// 	Core.Geometry.Geometry.points_from_geometry(geometry)

	// create_geometry_from_points: (points, index_mode)->
	// 	Core.Geometry.Geometry.geometry_from_points(points, index_mode)

	//
	//
	// BBOX
	//
	//
	bounding_box(): Box3 {
		return this._bounding_box != null ? this._bounding_box : (this._bounding_box = this._compute_bounding_box());
	}
	center(): Vector3 {
		const center = new Vector3();
		this.bounding_box().getCenter(center);
		return center;
	}
	size(): Vector3 {
		const size = new Vector3();
		this.bounding_box().getSize(size);
		return size;
	}

	private _compute_bounding_box() {
		const bbox = new Box3();
		if (this._content) {
			for (let object of this._content.objects()) {
				// const box = new Box3()
				// bbox.setFromObject(object);
				bbox.expandByObject(object);
			}
		}
		return bbox;
	}
}

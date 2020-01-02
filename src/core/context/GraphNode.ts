import {CoreObject} from 'src/core/Object'
import {NodeSimple} from 'src/core/graph/NodeSimple'

export class GraphNode extends CoreObject {
	_frame: number
	_param: any
	_container: any
	_entity_graph_node: any
	_entity: any

	constructor(private _node: any) {
		super()
	}

	node() {
		return this._node
	}

	set_param(param: any) {
		return (this._param = param)
	}
	param() {
		return this._param
	}

	set_frame(frame: number) {
		if (frame !== this._frame) {
			this._frame = frame
		}
	}
	//this.node().set_dirty()
	reset_frame() {
		this._frame = null
	}
	frame() {
		let f = this._frame
		if (f == null) {
			f = this.node()
				.scene()
				.frame()
		}
		return f
	}

	//
	//
	// geometry
	//
	//
	set_geometry_container(container: any) {
		return (this._container = container)
	}
	// center: (component)->
	// 	bbox = @_container.bounding_box()
	// 	center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5)
	// 	center[component]

	//
	//
	// points
	//
	//
	entity_graph_node() {
		return (this._entity_graph_node =
			this._entity_graph_node || this.create_entity_graph_node())
	}
	private create_entity_graph_node() {
		const node = new NodeSimple()
		node.set_scene(this.node().scene())
		return node
	}
	set_entity(entity: any) {
		this._entity = entity
		this.entity_graph_node().set_dirty()
		return this._node.invalidates_param_results() // TODO: that probably shouldn't need to happen
	}
	entity() {
		return this._entity
	}
	attrib_value(attrib_name: string) {
		return this._entity.attrib_value(attrib_name)
	}
}
// if attrib_name == 'ptnum'
// 	return @_point.index()
// else
// 	attrib_name = switch attrib_name
// 		when 'P' then 'position'
// 		else
// 			attrib_name
// 	@_point.attrib_value(attrib_name)

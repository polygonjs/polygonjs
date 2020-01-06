import {NodeScene} from 'src/core/graph/NodeScene'
import {NamedGraphNode} from 'src/core/graph/NamedGraphNode'

import {BaseParam} from 'src/engine/params/_Base'
import {GeometryContainer} from 'src/engine/containers/Geometry'

export class BaseNode extends NamedGraphNode(NodeScene) {
	root(): BaseNode {
		return this
	}
	parent(): BaseNode {
		return this
	}
	node(name: string): BaseNode {
		return this
	}
	param(name: string): BaseParam {
		return null
	}
	full_path(): string {
		return 'test full path'
	}
	params_node(): any {
		return null
	}
	type(): string {
		return ''
	}
	is_cooking(): boolean {
		return false
	}
	async request_container(): Promise<GeometryContainer> {
		return new Promise((resolve, reject) => {
			resolve(new GeometryContainer())
		})
	}
	input_graph_node(index: number): NodeScene {
		return null
	}
	input(index: number): BaseNode {
		return null
	}
}

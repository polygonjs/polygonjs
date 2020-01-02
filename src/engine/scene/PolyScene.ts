import {Scene} from 'three/src/scenes/Scene'
import {CoreGraph} from 'src/core/graph/CoreGraph'
import {CorePerformance} from 'src/core/performance/CorePerformance'
import {Cooker} from 'src/core/graph/Cooker'
import {EmitPayload} from 'src/core/graph/NodeScene'

// import {CoreObject} from 'src/core/CoreObject'

export class PolyScene {
	_display_scene: Scene = new Scene()
	_graph: CoreGraph
	_performance: CorePerformance
	_cooker: Cooker

	// constructor() {
	// 	const co = new CoreObject()
	// 	console.log('CoreObject', co)
	// }

	graph() {
		return this._graph
	}
	performance() {
		return this._performance
	}
	cooker() {
		return this._cooker
	}
	store_commit(event_name: string, payload: EmitPayload) {}
	emit_allowed() {
		return true
	}
	node(path: string) {}

	display_scene() {
		return this._display_scene
	}

	is_loading() {
		return true
	}
}

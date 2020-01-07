import {NodeScene} from 'src/core/graph/NodeScene'

// TODO: I may not need the ContextOwner in this class
// so I could do a NodeScene child class without it?
export class SceneContext extends NodeScene {
	private _frame: number = 1.0

	constructor() {
		super()
	}

	public frame(): number {
		return this._frame
	}
	public full_path(): string {
		return `scene context frame: ${this._frame}`
	}

	public increment_frame(): void {
		this.set_frame(this._frame + 1.0)
	}

	public set_frame(frame: number, message?: string): void {
		const new_frame = frame // parseFloat() ensure we can divide it and get a float
		if (this._frame === new_frame) {
			return
		}

		this._frame = new_frame
		this.set_graph_successors_dirty(this)

		// for playbar
		this.emit('scene_frame_updated')

		return null // if no null, some nodes are returned
	}
	set_graph_successors_dirty(scene: Scene) {
		// throw 'Scene.set_graph_successors_dirty requires implementation'
	}
	emit(event_type: string) {
		// throw 'Scene.emit requires implementation'
	}
}

import {BaseViewer} from '../_Base'

export function Controls<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseViewer = <unknown>this as BaseViewer

		protected _controls_active: boolean = false
		_bound_on_controls_start: ()=>void
		_bound_on_controls_end: ()=>void

		async _create_controls(){
			this._dispose_controls()

			const config = await this._camera_node.apply_controls( this._canvas )
			if (config){
				// this.current_camera_controls_node_graph_id = config.camera_controls_node_id()
				this._controls = config.controls()
				// this._controls_node = config.controls_node()

				if(this._controls){
					if(this._is_active){
						this._bind_controls()
					} else {
						this._dispose_controls()
					}
				}

				// test in case @_is_active has changed
				// if (this._is_active != true && this._controls){
				// 	this._dispose_controls()
					
				// }
				// TODO
				// we have to reassign the camera here, as this method is called twice
				// and the first time without the controls being present apparently.. (more tests needed)
				// CURRENT ANSWER: the method this.prepare_current_camera() is called twice on app load
				// which only cause problems when switching back to perspective.
				// @_current_camera = cloned_camera
				//@_controls = controls
				// this.$emit('before_controls_apply', controls)
			}
		}

		_bind_controls(){
			this._bound_on_controls_start = this._on_controls_start.bind(this)
			this._bound_on_controls_end = this._on_controls_end.bind(this)
			this._controls.addEventListener( 'start', this._bound_on_controls_start );
			this._controls.addEventListener( 'end', this._bound_on_controls_end );

		}

		_dispose_controls(){
			if(this._controls){
				this._camera_node.dispose_controls( this._canvas )

				if(this._bound_on_controls_start){
					this._controls.removeEventListener( 'start', this._bound_on_controls_start );
				}
				if(this._bound_on_controls_end){
					this._controls.removeEventListener( 'end', this._bound_on_controls_end );
				}

				this._controls.dispose()
				this._controls = null
			}
		}
		_on_controls_start(){
			this._controls_active = true
		}
		_on_controls_end(){
			this._controls_active = false
		}

	}
}
// import {BaseViewer} from '../_Base'
// import {EventHelper} from '../../../core/EventHelper'
// import {RayHelper} from '../../../core/RayHelper'

// import {Picker} from '../../nodes/Event/Picker'

// const MOUSE_MOVE_EVENT_NAME = 'mouse_move'
// const CLICK_EVENT_NAME = 'click'

// export function PickerForViewer<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		protected self: BaseViewer = <unknown>this as BaseViewer

// 		private picker_node_has_hit_object_by_event_type = {
// 			[MOUSE_MOVE_EVENT_NAME]: false,
// 			[CLICK_EVENT_NAME]: false,
// 		}
// 		private picker_nodes_on_mouse_move: Picker[] = []
// 		private picker_nodes_on_click: Picker[] = []

// 		_init_ray_helper(line_precision_mult:number=1){
// 			this.event_helper = new EventHelper(this._canvas)
// 			this.ray_helper = new RayHelper(this.event_helper, this._display_scene, line_precision_mult)
// 		}

// 		async update_picker_nodes(){
// 			this.set_picker_nodes_on_mouse_move(await this._scene.picker_nodes_on_mouse_move())
// 			this.set_picker_nodes_on_click(await this._scene.picker_nodes_on_click())
// 		}

// 		set_picker_nodes_on_mouse_move(picker_nodes: Picker[]){
// 			this.picker_nodes_on_mouse_move = picker_nodes
// 		}
// 		set_picker_nodes_on_click(picker_nodes: Picker[]){
// 			this.picker_nodes_on_click = picker_nodes
// 		}

// 		process_picker_nodes_on_mouse_move(event: MouseEvent){

// 			this.picker_node_has_hit_object_by_event_type[MOUSE_MOVE_EVENT_NAME] = false

// 			const nodes = this.picker_nodes_on_mouse_move
// 			if (nodes.length > 0){
// 				const c = ()=>{
// 					this.process_picker_nodes(nodes, event, MOUSE_MOVE_EVENT_NAME).then(() =>{
// 						this.set_container_class_from_picker_on_mouse_move()
// 					})
// 				}

// 				setTimeout(c, 0)

// 			}
// 		}

// 		process_picker_nodes_on_click(event:MouseEvent){
// 			this.picker_node_has_hit_object_by_event_type[CLICK_EVENT_NAME] = false

// 			const nodes = this.picker_nodes_on_click
// 			if (nodes.length > 0){
// 				const c = ()=>{
// 					this.process_picker_nodes(nodes, event, CLICK_EVENT_NAME)
// 				}
// 				setTimeout(c, 0)

// 			}
// 		}

// 		async process_picker_nodes(picker_nodes: Picker[], event:MouseEvent, event_type:string){
// 			for(let picker_node of picker_nodes){
// 				if((await picker_node.interrupting()) && this.picker_node_has_hit_object_by_event_type[event_type] == true){
// 					break;
// 				}
// 				await this.process_picker_node(picker_node, event, event_type)
// 			}
// 		}

// 		async process_picker_node(picker_node: Picker, event:MouseEvent, event_type: string){
// 			try {
// 				const has_hit_an_object = await picker_node.process(this._canvas, event, this._camera, this.ray_helper)
// 				if(has_hit_an_object){
// 					this.picker_node_has_hit_object_by_event_type[event_type] = true
// 				}
// 			} catch(e){
// 				console.warn(e)
// 			}
// 		}

// 		private set_container_class_from_picker_on_mouse_move(){
// 			if(this.picker_node_has_hit_object_by_event_type[MOUSE_MOVE_EVENT_NAME]){
// 				this.set_container_class_hovered()
// 			} else {
// 				this.reset_container_class()
// 			}
// 		}

// 	}
// }

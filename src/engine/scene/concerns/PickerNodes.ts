// import lodash_sortBy from 'lodash/sortBy'
// import {Picker} from '../../nodes/Event/Picker'

// export function PickerNodes<TBase extends Constructor>(Base: TBase) {
// 	return class extends Base {

// 		picker_nodes():Picker[]{
// 			let picker_nodes = []
// 			const event_nodes = this.root().nodes_by_type('events')
// 			for(let event_node of event_nodes){
// 				const event_picker_nodes = event_node.nodes_by_type('picker')
// 				for(let node of event_picker_nodes){
// 					if(!node.is_bypassed()){
// 						picker_nodes.push(node)
// 					}
// 				}
// 			}
// 			return picker_nodes
// 		}
// 		async picker_nodes_on_event_name(event_name:string): Picker[]{
// 			const nodes = []
// 			for(let picker_node of this.picker_nodes()){
// 				const matches_event = await picker_node.is_for_event(event_name)
// 				if(matches_event){
// 					nodes.push(picker_node)
// 				}
// 			}
// 			return await this._sorted_picker_nodes_by_interrupting(nodes)

// 		}
// 		async picker_nodes_on_mouse_move(): Picker[]{
// 			return await this.picker_nodes_on_event_name('mousemove')
// 		}
// 		async picker_nodes_on_click(): Picker[]{
// 			return await this.picker_nodes_on_event_name('mouseup')
// 		}

// 		async _sorted_picker_nodes_by_interrupting(nodes: Picker[]): Picker[]{
// 			return lodash_sortBy(nodes, async (node)=>{
// 				return (await node.interrupting()) ? 0 : 1
// 			})
// 		}

// 	}
// }

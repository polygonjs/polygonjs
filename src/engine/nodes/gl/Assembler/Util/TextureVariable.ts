import lodash_includes from 'lodash/includes'
import { Scene } from "src/Engine/Scene";
import {TextureAllocation} from './TextureAllocation'

export class TextureVariable {

	private _allocation: TextureAllocation
	private _position: number = -1

	private _graph_node_ids: string[] = []

	constructor(
		private _name: string,
		private _size: number
	){
		if(!_name){
			throw "TextureVariable requires a name"
		}
	}

	set_allocation(allocation:TextureAllocation){
		this._allocation = allocation
	}
	allocation(){
		return this._allocation
	}

	graph_node_ids(){return this._graph_node_ids}
	add_graph_node_id(id:string){
		if(!lodash_includes(this._graph_node_ids, id)){
			this._graph_node_ids.push(id)
		}
	}
	name(){return this._name}
	size(){return this._size}

	set_position(position: number){
		this._position = position
	}
	position(){
		return this._position
	}
	component():string{
		return 'xyzw'.split('').splice(this._position,this._size).join('')
	}
	to_json(scene: Scene){
		return {
			name: this.name(),
			nodes: this._graph_node_ids.map(id=>{
				return scene.graph().node_from_id(id).name()
			}).sort()
		}
	}

}
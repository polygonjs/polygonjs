// import axios from 'axios'
// import lodash_isString from 'lodash/isString'
// import Vue from 'vue'
// import History from 'src/Editor/History/_Module'

// const AVAILABLE_PRESETS = {
// 	cop: ['file'],
// 	gl: ['attribute'],
// 	obj: ['mapbox_camera'],
// 	sop: [
// 		'color',
// 		'data',
// 		'data_url',
// 		'file',
// 		'particles_system_gpu',
// 		'transform',
// 		'text'
// 	],
// 	event: [
// 		'camera_orbit_controls'
// 	]
// }

// export const Presets = {

// 	data(){
// 		return {
// 			preset_names: []
// 		}
// 	},

// 	mounted(){
// 		this.load_presets_manifest()
// 	},

// 	watch: {
// 		selected_graph_node_id(new_id, old_id){
// 			this.$nextTick(()=>{
// 				this.load_presets_manifest()
// 			})
// 		}
// 	},

// 	computed: {
// 		has_presets():boolean{
// 			return this.preset_names.length > 0
// 		},
// 		presets_key():string{
// 			return this.preset_names.join(';')
// 		},
// 		preset_entries(){
// 			return this.preset_names.map(preset_name=>{
// 				return {id: preset_name}
// 			})
// 		},
// 		preset_folder(){
// 			if(this.selected_node){
// 				const context = this.selected_node.node_context().toLowerCase()
// 				const type = this.selected_node.type()
// 				return `/editor/presets/${context}/${type}`
// 			}
// 		},
// 		is_preset_available(): boolean{
// 			if(this.selected_node){
// 				const context = this.selected_node.node_context().toLowerCase()
// 				const type = this.selected_node.type()
// 				return AVAILABLE_PRESETS[context] && (AVAILABLE_PRESETS[context].indexOf(type) >= 0)
// 			}
// 		},
// 	},
// 	methods: {
// 		load_presets_manifest(){
// 			if(this.is_preset_available && this.preset_folder){
// 				const manifest_url = `${this.preset_folder}/manifest.json?${Date.now()}`
// 				axios.get(manifest_url).then(response=>{
// 					let data = []
// 					if(lodash_isString(response.data)){
// 						const context = this.selected_node.node_context().toLowerCase()
// 						const type = this.selected_node.type()
// 						console.warn(`could not fetch presets manifest for ${this.selected_node.full_path()} (${context}/${type})`)
// 					} else {
// 						data = response.data
// 					}
// 					Vue.set(this, 'preset_names', data)
// 				}).catch(error=>{
// 					console.warn(error)
// 					Vue.set(this, 'preset_names', [])
// 				})
// 			} else {
// 				Vue.set(this, 'preset_names', [])
// 			}
// 		},
// 		use_preset(entry){
// 			const preset_url = `${this.preset_folder}/${entry}.json?${Date.now()}`
// 			axios.get(preset_url).then(response=>{
// 				if(lodash_isString(response.data)){
// 					console.warn(`could not fetch presets from url ${preset_url}`)
// 				} else {
// 					const data = response.data
// 					const command = new History.Command.Multiple()

// 					Object.keys(data).forEach(param_name=>{
// 						if(this.selected_node.has_param(param_name)){
// 							const param = this.selected_node.param(param_name)
// 							const value = data[param_name]

// 							let sub_command;
// 							if(value.expression){
// 								sub_command = new History.Command.ParamSet(param, {expression: value.expression})
// 							} else {
// 								sub_command = new History.Command.ParamSet(param, {value: value})
// 							}
// 							command.push_command(sub_command)
// 						} else {
// 							console.warn(`param '${param_name}' does not exist on node '${this.selected_node.full_path()}'`)
// 						}
// 					})

// 					command.push(this)
// 				}

// 			}).catch(error=>{
// 				console.warn("error", error)
// 			})
// 		}
// 	}
// }

// import axios from 'axios'
// import lodash_isString from 'lodash/isString'
// import Vue from 'vue'

// const AVAILABLE_DESCRIPTIONS = {
// 	mat: ['shader_builder'],
// 	sop: [
// 		'copy',
// 		'data',
// 		'file',
// 		'instance',
// 		'particles_system_gpu'
// 	]
// }

// export const ParamDescription = {

// 	data(){
// 		return {
// 			param_descriptions: {}
// 		}
// 	},

// 	mounted(){
// 		this.load_params_manifest()
// 	},

// 	watch: {
// 		selected_graph_node_id(new_id, old_id){
// 			this.$nextTick(()=>{
// 				this.load_params_manifest()
// 			})
// 		}
// 	},

// 	computed: {
// 		// has_param_descriptions():boolean{
// 		// 	return Object.keys(this.param_descriptions).length > 0
// 		// },
// 		params_description_folder(){
// 			if(this.selected_node){
// 				const context = this.selected_node.node_context().toLowerCase()
// 				const type = this.selected_node.type()
// 				return `/editor/params/${context}/${type}`
// 			}
// 		},
// 		is_manifest_available(): boolean{
// 			if(this.selected_node){
// 				const context = this.selected_node.node_context().toLowerCase()
// 				const type = this.selected_node.type()
// 				return AVAILABLE_DESCRIPTIONS[context] && (AVAILABLE_DESCRIPTIONS[context].indexOf(type) >= 0)
// 			}
// 		},
// 	},
// 	methods: {
// 		load_params_manifest(){
// 			if(this.is_manifest_available && this.params_description_folder){
// 				const manifest_url = `${this.params_description_folder}/params.json?${Date.now()}`

// 				axios.get(manifest_url).then(response=>{
// 					let data = {}
// 					if(lodash_isString(response.data)){
// 						const context = this.selected_node.node_context().toLowerCase()
// 						const type = this.selected_node.type()
// 						console.warn(`could not fetch presets manifest for ${this.selected_node.full_path()} (${context}/${type})`)
// 					} else {
// 						data = response.data
// 					}
// 					Vue.set(this, 'param_descriptions', data)
// 				}).catch(error=>{
// 					Vue.set(this, 'param_descriptions', {})
// 				})
// 			} else {
// 				Vue.set(this, 'param_descriptions', {})
// 			}
// 		},
// 	}
// }

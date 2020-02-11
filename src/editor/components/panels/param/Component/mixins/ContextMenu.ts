

export const ContextMenu = {
	methods: {
		on_contextmenu(event){

			const menu_param_id = this.$store.getters['editor/menu/param_id']
			const current_param_id = this.param.graph_node_id()
			if(menu_param_id == current_param_id){
				this.on_contextmenu_close()
			} else {
				this.$store.commit('editor/menu/param_id', current_param_id)
			}
			this.$store.commit('editor/menu/position', {
				x: event.pageX,
				y: event.pageY
			})
		},
		on_contextmenu_close(){
			this.$store.commit('editor/menu/param_id', null)
		},
	}
}

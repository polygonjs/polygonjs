import {EngineParamData} from 'src/editor/store/modules/Engine';
import {BaseParamType} from 'src/engine/params/_Base';

// import {onMounted, onBeforeUnmount, watch} from '@vue/composition-api';

export function SetupEmit(json_param: EngineParamData, param: BaseParamType) {
	// onMounted(()=>{
	// 	unblock_param_emit()
	// })
	// onBeforeUnmount(()=>{
	// 	block_param_emit();
	// })

	// watch(json_param, (new_json_param, old_json_param)=>{
	// 	const graph = this.$store.scene.graph();
	// 	const new_param = graph.node_from_id(this.new_json_param != null ? this.new_json_param.graph_node_id : undefined);
	// 	const old_param = graph.node_from_id(this.old_json_param != null ? this.old_json_param.graph_node_id : undefined);
	// 	if (new_param) {
	// 		this.unblock_param_emit(new_param);
	// 	}
	// 	if (old_param) {
	// 		return this.block_param_emit(old_param);
	// 	}
	// })

	// function block_param_emit(param){
	// 	if (param == null) { ({ param } = this); }
	// 	// console.log("block", @param.full_path())
	// 	return param.block_emit();
	// }

	// function unblock_param_emit(param){
	// 	if (param == null) { ({ param } = this); }
	// 	// console.log("unblock", @param.full_path())
	// 	param.unblock_emit();
	// 	param.emit_param_updated(); // TODO: that should be replaced by querying the node if it is dirty

	// 	// emitting for the components is currently a little redundant as it also creates an emit for the parent each time, but that's the only way I have for now to ensure that the component of an expression will be updated accordingly in the store
	// 	if (param.is_multiple()) {
	// 		return param.components().forEach(c=> {
	// 			return c.emit_param_updated();
	// 		});
	// 	}
	// }

	return {};
}

// events
export enum NodeEvent {
	CREATED = 'node_created',
	DELETED = 'node_deleted',
	NAME_UPDATED = 'node_name_update',
	OVERRIDE_CLONABLE_STATE_UPDATE = 'node_override_clonable_state_update',
	NAMED_OUTPUTS_UPDATED = 'node_named_outputs_updated',
	NAMED_INPUTS_UPDATED = 'node_named_inputs_updated',
	INPUTS_UPDATED = 'node_inputs_updated',
	PARAMS_UPDATED = 'node_params_updated',
	UI_DATA_POSITION_UPDATED = 'node_ui_data_position_updated',
	UI_DATA_COMMENT_UPDATED = 'node_ui_data_comment_updated',
	ERROR_UPDATED = 'node_error_updated',
	FLAG_BYPASS_UPDATED = 'bypass_flag_updated',
	FLAG_DISPLAY_UPDATED = 'display_flag_updated',
	SELECTION_UPDATED = 'selection_updated',
}

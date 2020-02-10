// import lodash_find from 'lodash/find';
// import lodash_each from 'lodash/each';
// import lodash_includes from 'lodash/includes';
// import lodash_filter from 'lodash/filter';
// import lodash_keys from 'lodash/keys';
// import lodash_map from 'lodash/map';
import {BaseNodeType} from 'src/engine/nodes/_Base';

import {EditorClipboardStateModule} from './editor/Clipboard';
import {EditorContextMenuStateModule} from './editor/ContextMenu';
// import CustomNode from './editor/CustomNode';
// import DesktopLocalAssetUploadProgress from './editor/DesktopLocalAssetUploadProgress';
import {EditorDialogAlertStateModule} from './editor/DialogAlert';
// import {EditorDialogPromptStateModule} from './editor/DialogConfirm';
import {EditorDialogPromptStateModule} from './editor/DialogPrompt';
// import ParamNodeSelector from './editor/ParamNodeSelector';
import {EditorPanelNodeSelectorStateModule} from './editor/PanelNodeSelector';
import {EditorNetworkStateModule} from './editor/Network';
import {EditorNumericSliderStateModule} from './editor/NumericSlider';
import {EditorDialogConfirmStateModule} from './editor/DialogConfirm';
// import StatusBar from './editor/StatusBar';

// const root_json_children = function(rootState, rootGetters, condition_method) {
// 	const json_root = rootGetters['engine/json_root'];
// 	const nodes_by_id = rootState.engine.nodes_by_graph_node_id;
// 	let json_nodes = lodash_map(lodash_keys(nodes_by_id), function(id) {
// 		let json_node;
// 		return (json_node = nodes_by_id[id]);
// 	});

// 	json_nodes = lodash_filter(json_nodes, (json_node) =>
// 		lodash_includes(json_root.children, json_node['graph_node_id'])
// 	);

// 	return lodash_filter(json_nodes, condition_method);
// };

// const json_nodes_by_type = function(rootState, rootGetters, type) {
// 	const json_root = rootGetters['engine/json_root'];
// 	const nodes_by_id = rootState.engine.nodes_by_graph_node_id;
// 	const json_nodes = lodash_map(lodash_keys(nodes_by_id), function(id) {
// 		let json_node;
// 		return (json_node = nodes_by_id[id]);
// 	});

// 	return lodash_filter(json_nodes, (json_node) => json_node['type'] === type);
// };

export interface EditorState {
	current_node_id?: string;
	current_camera_name?: string;
	current_node_selection_ids: string[];
	// forced_resize_count: 0
	// uploads_reload_required: boolean;
	display_loader: boolean;

	// modules
	// dialog_alert: EditorDialogAlertState;
	// dialog_prompt: EditorDialogPromptState;
}

export const EditortoreModule = {
	namespaced: true,
	modules: {
		clipboard: EditorClipboardStateModule,
		context_menu: EditorContextMenuStateModule,
		// custom_node: CustomNode,
		// desktop_local_asset_upload_progress: DesktopLocalAssetUploadProgress,
		dialog_alert: EditorDialogAlertStateModule,
		dialog_confirm: EditorDialogConfirmStateModule,
		dialog_prompt: EditorDialogPromptStateModule,
		network: EditorNetworkStateModule,
		numeric_slider: EditorNumericSliderStateModule,
		// param_node_selector: ParamNodeSelector,
		panel_node_selector: EditorPanelNodeSelectorStateModule,
		// status_bar: StatusBar,
	},
	state(): EditorState {
		return {
			current_node_id: undefined,
			current_camera_name: undefined,
			current_node_selection_ids: [],
			// fps: null,
			// forced_resize_count: 0
			// uploads_reload_required: false,
			display_loader: true,
		};
	},
	// network_properties:
	// 	camera_settings_by_ids: {}
	// viewer_properties:
	// 	display_topbar: true
	//camera_index: -1
	// pickers:
	// 	interrupting: []
	// 	default: []
	// panels: []

	getters: {
		display_loader(state: EditorState) {
			return state.display_loader;
		},

		// properties(state:EditorState) {
		// 	const unsaved_keys = ['fps'];
		// 	const props = {};
		// 	lodash_each(lodash_keys(state), function(key) {
		// 		if (!lodash_includes(unsaved_keys, key)) {
		// 			return (props[key] = state[key]);
		// 		}
		// 	});

		// 	return props;
		// },

		// viewer_properties: (state)->
		// 	state.viewer_properties

		current_node_id(state: EditorState) {
			return state.current_node_id;
		},
		// current_json_node(state, getters, rootState) {
		// 	return rootState.engine.nodes_by_graph_node_id[state.current_node_id];
		// },
		// fps(state) {
		// 	return state.fps;
		// },
		// uploads_reload_required(state) {
		// 	return state.uploads_reload_required;
		// },

		//
		//
		// CAMERAS
		//
		//
		// json_camera_nodes(state, getters, rootState, rootGetters) {
		// 	const allowed_camera_types = ['perspective_camera', 'orthographic_camera', 'mapbox_camera'];
		// 	return root_json_children(rootState, rootGetters, function(json_node) {
		// 		const type = json_node['type'];
		// 		return lodash_includes(allowed_camera_types, type);
		// 	});
		// },
		// // lodash_includes(type, 'camera')
		// mapbox_camera_nodes(state, getters, rootState, rootGetters) {
		// 	return json_nodes_by_type(rootState, rootGetters, 'mapbox_camera');
		// },

		// current_json_camera_node(state, getters) {
		// 	const json_cameras = getters['editor/json_camera_nodes'];
		// 	if (state.current_camera_name == null) {
		// 		return json_cameras[0];
		// 	} else {
		// 		let json_camera = lodash_find(
		// 			json_cameras,
		// 			(json_camera) => json_camera.name === state.current_camera_name
		// 		);

		// 		return json_camera != null ? json_camera : (json_camera = json_cameras[0]);
		// 	}
		// },

		//
		//
		// BY TYPE
		//
		//
		// json_event_nodes(state, getters, rootState, rootGetters) {
		// 	return json_nodes_by_type(rootState, rootGetters, 'event');
		// },

		// json_picker_nodes(state, getters, rootState, rootGetters) {
		// 	const json_nodes = json_nodes_by_type(rootState, rootGetters, 'picker');
		// 	const non_bypassed_json_nodes = lodash_filter(json_nodes, (json_node) => !json_node['flags']['bypass']);
		// 	return non_bypassed_json_nodes;
		// },

		// json_panel_nodes(state, getters, rootState, rootGetters) {
		// 	return json_nodes_by_type(rootState, rootGetters, 'panel');
		// },
	},

	// network_camera_properties: (state)->
	// 	current_node_id = state.current_node_id
	// 	properties = lodash_cloneDeep state.network_properties.camera_settings_by_ids[current_node_id]
	// 	if !properties?
	// 		properties = localStorage['network_camera_properties']
	// 		try
	// 			properties = JSON.parse(properties)
	// 			properties = properties[current_node_id]
	// 		catch
	// 			console.warn("could not parse network properties", properties)

	// 	properties
	// forced_resize_count: (state)->
	// 	state.forced_resize_count

	mutations: {
		// properties: (state, properties)->
		// 	state.current_node_id = properties.current_node_id
		// 	state.current_camera_name = properties.current_camera_name
		// 	state.current_node_selection_ids = properties.current_node_selection_ids

		// viewer_properties: (state, properties)->
		// 	Vue.set(state, 'viewer_properties', properties)

		// network_camera_properties: (state, properties)->
		// 	current_node_id = state.current_node_id
		// 	properties = lodash_cloneDeep(properties)
		// 	state.network_properties.camera_settings_by_ids[current_node_id] = properties
		// 	localStorage['network_camera_properties'] = JSON.stringify(state.network_properties.camera_settings_by_ids)

		current_node(state: EditorState, node: BaseNodeType) {
			if (!node.children_allowed()) {
				return;
			}
			state.current_node_id = node.graph_node_id;
		},

		// current_camera: (state, node)->
		// 	state.current_camera_name = node.name()
		// fps(state, fps) {
		// 	return (state.fps = fps);
		// },

		// force_resize: (state)->
		// 	state.forced_resize_count += 1

		// set_uploads_reload_required(state) {
		// 	return (state.uploads_reload_required = true);
		// },
		// unset_uploads_reload_required(state) {
		// 	return (state.uploads_reload_required = false);
		// },
		hide_loader(state: EditorState) {
			return (state.display_loader = false);
		},
	},
};

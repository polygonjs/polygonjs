import lodash_cloneDeep from 'lodash/cloneDeep'
import lodash_find from 'lodash/find'
import lodash_each from 'lodash/each'
import lodash_includes from 'lodash/includes'
import lodash_filter from 'lodash/filter'
import lodash_keys from 'lodash/keys'
import lodash_map from 'lodash/map'
import Vue from 'vue'

import Clipboard from './Editor/Clipboard'
import CustomNode from './Editor/CustomNode'
import DesktopLocalAssetUploadProgress from './Editor/DesktopLocalAssetUploadProgress'
import DialogAlert from './Editor/DialogAlert'
import DialogConfirm from './Editor/DialogConfirm'
import DialogPrompt from './Editor/DialogPrompt'
import ParamNodeSelector from './Editor/ParamNodeSelector'
import PanelNodeSelector from './Editor/PanelNodeSelector'
import Menu from './Editor/Menu'
import Network from './Editor/Network'
import NumericSlider from './Editor/NumericSlider'
import StatusBar from './Editor/StatusBar'

root_json_children = (rootState, rootGetters, condition_method)->
	json_root = rootGetters['engine/json_root']
	nodes_by_id = rootState.engine.nodes_by_graph_node_id
	json_nodes = lodash_map lodash_keys(nodes_by_id), (id)->
		json_node = nodes_by_id[id]

	json_nodes = lodash_filter json_nodes, (json_node)->
		lodash_includes(json_root.children, json_node['graph_node_id'])

	lodash_filter json_nodes, condition_method

json_nodes_by_type = (rootState, rootGetters, type)->
	json_root = rootGetters['engine/json_root']
	nodes_by_id = rootState.engine.nodes_by_graph_node_id
	json_nodes = lodash_map lodash_keys(nodes_by_id), (id)->
		json_node = nodes_by_id[id]

	lodash_filter json_nodes, (json_node)->
		json_node['type'] == type


export default component =
	namespaced: true
	modules:
		clipboard: Clipboard
		custom_node: CustomNode
		desktop_local_asset_upload_progress: DesktopLocalAssetUploadProgress
		dialog_alert: DialogAlert
		dialog_confirm: DialogConfirm
		dialog_prompt: DialogPrompt
		menu: Menu
		network: Network
		numeric_slider: NumericSlider
		param_node_selector: ParamNodeSelector
		panel_node_selector: PanelNodeSelector
		status_bar: StatusBar
	state: ->
		current_node_id: null
		current_camera_name: null
		current_node_selection_ids: []
		fps: null
		# forced_resize_count: 0
		uploads_reload_required: false
		display_loader: true
		# network_properties:
		# 	camera_settings_by_ids: {}
		# viewer_properties:
		# 	display_topbar: true
		#camera_index: -1
		# pickers: 
		# 	interrupting: []
		# 	default: []
		# panels: []

	getters:
		display_loader: (state)-> state.display_loader

		properties: (state)->
			unsaved_keys = ['fps']
			props = {}
			lodash_each lodash_keys(state), (key)->
				if !lodash_includes(unsaved_keys, key)
					props[key] = state[key]

			props

		# viewer_properties: (state)->
		# 	state.viewer_properties


		current_node_id: (state)-> state.current_node_id
		current_json_node: (state, getters, rootState)->
			rootState.engine.nodes_by_graph_node_id[state.current_node_id]
		fps: (state)->
			state.fps
		uploads_reload_required: (state)->
			state.uploads_reload_required


		#
		#
		# CAMERAS
		#
		#
		json_camera_nodes: (state, getters, rootState, rootGetters)->
			allowed_camera_types = ['perspective_camera', 'orthographic_camera', 'mapbox_camera']
			root_json_children rootState, rootGetters, (json_node)->
				type = json_node['type']
				lodash_includes(allowed_camera_types, type)
				# lodash_includes(type, 'camera')
		mapbox_camera_nodes: (state, getters, rootState, rootGetters)->
			json_nodes_by_type(rootState, rootGetters, 'mapbox_camera')

		current_json_camera_node: (state, getters)->
			json_cameras = getters['editor/json_camera_nodes']
			if !state.current_camera_name?
				json_cameras[0]
			else
				json_camera = lodash_find json_cameras, (json_camera)->
					json_camera.name == state.current_camera_name

				json_camera ?= json_cameras[0]

		#
		#
		# BY TYPE
		#
		#
		json_event_nodes: (state, getters, rootState, rootGetters)->
			json_nodes_by_type(rootState, rootGetters, 'event')

		json_picker_nodes: (state, getters, rootState, rootGetters)->
			json_nodes = json_nodes_by_type(rootState, rootGetters, 'picker')
			non_bypassed_json_nodes = lodash_filter json_nodes, (json_node)->!json_node['flags']['bypass']
			non_bypassed_json_nodes

		json_panel_nodes: (state, getters, rootState, rootGetters)->
			json_nodes_by_type(rootState, rootGetters, 'panel')

		# network_camera_properties: (state)->
		# 	current_node_id = state.current_node_id
		# 	properties = lodash_cloneDeep state.network_properties.camera_settings_by_ids[current_node_id]
		# 	if !properties?
		# 		properties = localStorage['network_camera_properties']
		# 		try
		# 			properties = JSON.parse(properties)
		# 			properties = properties[current_node_id]
		# 		catch
		# 			console.warn("could not parse network properties", properties)

		# 	properties
		# forced_resize_count: (state)->
		# 	state.forced_resize_count


	mutations:
		# properties: (state, properties)->
		# 	state.current_node_id = properties.current_node_id
		# 	state.current_camera_name = properties.current_camera_name
		# 	state.current_node_selection_ids = properties.current_node_selection_ids

		# viewer_properties: (state, properties)->
		# 	Vue.set(state, 'viewer_properties', properties)

		# network_camera_properties: (state, properties)->
		# 	current_node_id = state.current_node_id
		# 	properties = lodash_cloneDeep(properties)
		# 	state.network_properties.camera_settings_by_ids[current_node_id] = properties
		# 	localStorage['network_camera_properties'] = JSON.stringify(state.network_properties.camera_settings_by_ids)

		current_node: (state, node)->
			return if !node.children_allowed()
			state.current_node_id = node.graph_node_id()

		# current_camera: (state, node)->
		# 	state.current_camera_name = node.name()
		fps: (state, fps)->
			state.fps = fps

		# force_resize: (state)->
		# 	state.forced_resize_count += 1

		set_uploads_reload_required: (state)->
			state.uploads_reload_required = true
		unset_uploads_reload_required: (state)->
			state.uploads_reload_required = false
		hide_loader: (state)->
			state.display_loader = false



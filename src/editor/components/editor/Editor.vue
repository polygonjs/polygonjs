<template lang="pug">

	//- include /pug/mixins.pug

	doctype html

	.Editor.full_page_height.grid-y(
		@contextmenu.capture.prevent = ''
		)
		//- ParamNodeSelector
		//- PanelNodeSelector
		//- DialogAlert
		//- DialogConfirm
		//- DialogPrompt
		//- LocalAssetUploadProgressDisplay

		Retractable
			//- TopBar(
			//- 	:scene_update_allowed = 'scene_update_allowed'
			//- 	:username = 'username'
			//- )
			NavigationBar
		//- MultiplePanel(
		//- 	:init_properties = "init_properties['multiple_panel']"
		//- 	:scene_update_allowed = 'scene_update_allowed'
		//- 	ref = 'multiple_panel'
		//- 	)
		PlayBar
		//- FooterBar
		//- NumericSlider

		//- NodeMenu
		//- ParamMenu
		//- UploadMenu




</template>

<script lang="ts">
// third party libs
// import lodash_trim from 'lodash/trim'
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';

// internal libs
// import KeyEventsDispatcher from './Helper/KeyEventsDispatcher'
// import {SceneJsonExporter} from 'src/Engine/IO/Json/Export/Scene'

// helper
// import {WindowCloserController} from './Helper/WindowCloserController'

// mixins
// import EventsDispatcher from './Mixin/EventsDispatcher';
// import HistoryMixin from './Mixin/History';
// import NodeOwner from './Mixin/NodeOwner';

// components
// import TopBar from './Bar/Top'
import NavigationBar from './top/Navigation.vue';
import PlayBar from './widgets/PlayBar.vue';
// import FooterBar from './Bar/Footer'
// import MultiplePanel from './Panel/Multiple/Multiple'
// import ParamNodeSelector from './Widget/ParamNodeSelector'
// import PanelNodeSelector from './Widget/PanelNodeSelector'
// import NumericSlider from './Widget/NumericSlider'
// import NodeMenu from './Widget/NodeMenu'
// import ParamMenu from './Widget/ParamMenu'
// import UploadMenu from './Widget/UploadMenu'
import Retractable from './widgets/Retractable.vue';
// import DialogAlert from './Widget/DialogAlert'
// import DialogConfirm from './Widget/DialogConfirm'
// import DialogPrompt from './Widget/DialogPrompt'
// import LocalAssetUploadProgressDisplay from './Widget/LocalAssetUploadProgressDisplay'

import {createComponent} from '@vue/composition-api';
export default createComponent({
	name: 'editor',
	// mixins: [EventsDispatcher, HistoryMixin, NodeOwner],
	components: {
		// DialogAlert,
		// DialogConfirm,
		// DialogPrompt,
		NavigationBar,
		// FooterBar,
		// LocalAssetUploadProgressDisplay,
		// MultiplePanel,
		// NodeMenu,
		// ParamMenu,
		// ParamNodeSelector,
		// PanelNodeSelector,
		PlayBar,
		Retractable,
		// NumericSlider,
		// TopBar,
		// UploadMenu,
	},

	props: {
		// init_properties:
		// 	type: Object
		// 	default: -> {}
		// scene_update_allowed:
		// 	type: Boolean
		// 	default: false
		// username:
		// 	type: String
		// 	default: null
	},

	created: () => {
		// this._init_history()
		// @_key_events_dispatcher = new KeyEventsDispatcher(this)
		// window.key_events_dispatcher = @_key_events_dispatcher
		// if this.scene_update_allowed
		// 	new WindowCloserController(this)
		// this.from_json(@init_properties)
	},

	methods: {
		// open_node: (node)=>{
		// 	return this.$store.commit('editor/current_node', node);
		// },
		// to_json:()=>{
		// 	const current_node_id = this.$store.getters['editor/current_node_id'];
		// 	const obj =
		// 		{multiple_panel: this.$refs.multiple_panel.to_json()};
		// 	if (current_node_id != null) {
		// 		const current_node = this.$store.scene.graph().node_from_id(current_node_id);
		// 		obj['current_node'] = current_node.full_path();
		// 	}
		// 	return obj;
		// },
		// from_json: (json)=>{
		// 	let current_node_full_path;
		// 	if ((current_node_full_path = json['current_node']) != null) {
		// 		let node;
		// 		if ((node = this.$store.scene.node(current_node_full_path)) != null) {
		// 			return this.open_node(node);
		// 		}
		// 	}
		// },
		// save_scene: async ()=>{
		// 	if (!this.scene_update_allowed) {
		// 		return window.POLY_alert("You do not have permission to save this scene");
		// 	} else {
		// 		this.$store.commit('editor/status_bar/loading', 'Saving...');
		// 		const { scene } = this.$store;
		// 		let scene_name = scene.name();
		// 		// scene_name = 'test'
		// 		if (scene_name != null) {
		// 			return this.save_scene_with_name(scene_name);
		// 		} else {
		// 			scene_name = await window.POLY_prompt(this, 'Scene Title', 'new scene');
		// 			if ((scene_name != null) && (lodash_trim(scene_name).length > 0)) {
		// 				return this.save_scene_with_name(scene_name);
		// 			}
		// 		}
		// 	}
		// },
		// save_scene_with_name: (scene_name:string)=>{
		// 	const form = document.querySelectorAll('form')[0];
		// 	if (form != null) {
		// 		const name_input = document.getElementById('scene_name');
		// 		const code_input = document.getElementById('scene_code');
		// 		const code_editor_input = document.getElementById('scene_code_editor');
		// 		const node_context_signatures_input = document.getElementById('scene_node_context_signatures');
		// 		const js_version_input = document.getElementById('scene_js_version');
		// 		const submit_button = form.querySelectorAll('input[type=submit]')[0];
		// 		name_input.value = scene_name;
		// 		const scene_exporter = new SceneJsonExporter(scene);
		// 		const json_data = scene_exporter.data();
		// 		code_input.value = JSON.stringify(json_data, null, 1);
		// 		code_editor_input.value = JSON.stringify( this.to_json(), null, 1 );
		// 		node_context_signatures_input.value = scene.node_context_signatures().join(';');
		// 		js_version_input.value = POLY.js_version();
		// 		this.$store.history.mark_scene_as_saved();
		// 		return submit_button.click();
		// 	}
		// },
		// go_down: ()=>{
		// 	let node;
		// 	const selection = this.node.selection();
		// 	if ((node = selection.nodes()[0]) != null) {
		// 		return this.open_node(node);
		// 	}
		// },
		// go_up: ()=>{
		// 	let parent;
		// 	if ((parent = this.node.parent()) != null) {
		// 		return this.open_node(parent);
		// 	}
		// },
		// dispatch_event: (node, properties)=>{
		// 	const event = this.create_event(node, properties);
		// 	const viewers = this.$refs.multiple_panel.viewers();
		// 	return lodash_each(viewers, viewer=> viewer.process_event(event));
		// },
		// panel_with_id: (panel_id)=>{
		// 	return this.$refs.multiple_panel.panel_with_id(panel_id);
		// }
	},
});
</script>

<style lang="sass">
@import "globals.sass"
@import "foundation/foundation.sass"

// body
// 	// this seems necessary to prevent a scrollbar when using the numeric slider component
// 	// in a param field close to the bottom of the screen
// 	// I'm unsure why having overflow: hidden in the editor is not enough
// 	// this is now mentioned in the html layout, to prevent the product pages from being affected
// 	overflow: hidden

.Editor
	background-color: $color_bg
	color: $color_font
	overflow: hidden // this ensure that the tab menu will not create a scrollbar when overflowing

// input[type=text]
// 	font-size: 0.9rem // to see the '_' on chrome
// 	// TODO: apply it to any other input on the site
// [type='text'], [type='password'], [type='date'], [type='datetime'], [type='datetime-local'], [type='month'], [type='week'], [type='email'], [type='number'], [type='search'], [type='tel'], [type='time'], [type='url'], [type='color'], textarea
// 	background-color: mix($color_bg, $color_font, 50%)
// 	border: 0px
// 	// padding: 0px 10px
// 	// height: auto
// 	// font-size: 0.85rem
// [type='text']:focus, [type='password']:focus, [type='date']:focus, [type='datetime']:focus, [type='datetime-local']:focus, [type='month']:focus, [type='week']:focus, [type='email']:focus, [type='number']:focus, [type='search']:focus, [type='tel']:focus, [type='time']:focus, [type='url']:focus, [type='color']:focus, textarea:focus
// 	background-color: mix($color_bg, $color_font, 20%)

// label
// 	color: $color_font


.full_height_container
	height: 100%
.full_page_height
	height: 100vh

.disable-select
	user-select: none
	-webkit-user-select: none
	-khtml-user-select: none
	-moz-user-select: none
	-ms-user-select: none

// to avoid the double dropdown arrow on selects
select.select
	background-image: none
</style>

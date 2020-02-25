<template lang="pug">

	include /mixins.pug

	doctype html

	.TopMenu.cell.shrink.app_header.grid-x
		.cell.shrink
			DropDownMenu(
				label = 'File'
				:entries = 'file_menu_entries'
				@select = 'on_file_menu_entry_select'
			)
			DropDownMenu(
				label = 'Edit'
				:entries = 'edit_menu_entries'
				@select = 'on_edit_menu_entry_select'
			)
			DropDownMenu(
				v-if = 'display_desktop_entries'
				label = 'Desktop'
				:entries = 'desktop_menu_entries'
				@select = 'on_desktop_menu_entry_select'
			)



</template>

<script lang="ts">
import DropDownMenu from 'src/editor/components/widgets/DropDownMenu.vue';
import {DropDownMenuEntry} from '../../types/props';
// import {SceneJsonExporter} from 'src/engine/io/json/export/Scene';

enum FileEntryId {
	// NEW = 'new',
	SAVE = 'save',
	// SETTINGS = 'settings',
	// PLAY = 'play',
	// DASHBOARD = 'dashboard',
}
enum EditEntryId {
	UNDO = 'undo',
	REDO = 'redo',
}
enum DesktopEntryId {
	UPLOAD = 'upload_assets',
	ABOUT = 'about',
}

import {defineComponent, computed} from '@vue/composition-api';
import {HistoryStack} from '../../../history/Stack';
import {StoreController} from '../../../store/controllers/StoreController';
export default defineComponent({
	name: 'top_menu',
	components: {DropDownMenu},
	props: {
		scene_update_allowed: {
			type: Boolean,
			default: false,
		},
		username: {
			type: String,
			default: null,
		},
	},
	setup(props) {
		const display_desktop_entries = computed(() => {
			return false; //POLY.desktop_controller().active();
		});

		const file_menu_entries = computed(() => {
			const entries: DropDownMenuEntry[] = [
				// {id: FileEntryId.NEW},
				{id: FileEntryId.SAVE, disabled: !props.scene_update_allowed},
				// {id: FileEntryId.SETTINGS, disabled: !props.scene_update_allowed},
				// {id: 'embed', disabled: !props.scene_update_allowed},
				// {id: FileEntryId.PLAY, disabled: !props.scene_update_allowed},
				// {id: FileEntryId.DASHBOARD},
			];

			return entries;
		});

		const edit_menu_entries = computed(() => {
			// I could add a disable state depending on the history stack
			// but not sure that it is reactive yet
			const entries: DropDownMenuEntry[] = [{id: EditEntryId.UNDO}, {id: EditEntryId.REDO}];

			return entries;
		});

		const desktop_menu_entries = computed(() => {
			const entries = [
				{id: DesktopEntryId.UPLOAD, label: 'Upload Assets'},
				{id: DesktopEntryId.ABOUT, label: 'About Desktop'},
			];

			return entries;
		});

		// functions
		function on_file_menu_entry_select(entry: FileEntryId) {
			switch (entry) {
				// case FileEntryId.NEW:
				// 	return redirect_to_new_scene();
				case FileEntryId.SAVE:
					return _save();
				// case FileEntryId.SETTINGS:
				// 	return redirect_to_settings();
				// case 'embed':
				// 	return redirect_to_embed();
				// case FileEntryId.PLAY:
				// 	return redirect_to_play();
				// case FileEntryId.DASHBOARD:
				// 	return redirect_to_dashboard();
			}
		}

		function on_edit_menu_entry_select(entry: EditEntryId) {
			switch (entry) {
				case EditEntryId.UNDO:
					return undo();
				case EditEntryId.REDO:
					return redo();
			}
		}

		function on_desktop_menu_entry_select(entry: DesktopEntryId) {
			switch (entry) {
				case DesktopEntryId.UPLOAD:
					return upload_desktop_assets();
				case DesktopEntryId.ABOUT:
					return open_desktop_about_dialog();
			}
		}

		async function _save() {
			// importing SceneJsonExporter dynamically, otherwise it seems that classes
			// are not loaded in the right order, creating an exception when opening the editor
			StoreController.save_scene();
		}
		function undo() {
			return HistoryStack.instance().undo();
		}
		function redo() {
			return HistoryStack.instance().redo();
		}

		function upload_desktop_assets() {
			// return POLY.desktop_controller().upload_assets($store.scene, () => {
			// 	return save();
			// });
		}

		function open_desktop_about_dialog() {
			// const version = POLY.desktop_controller().version();
			// return window.POLY_alert(this, `Polygonjs Desktop App (version ${version})`, {title: 'About'});
		}

		// function redirect_to_new_scene() {
		// 	return redirect_to('scenes/new');
		// }
		// function redirect_to_settings() {
		// 	return redirect_to_scene_path('settings');
		// }
		// function redirect_to_embed() {
		// 	return redirect_to_scene_path('embed');
		// }
		// function redirect_to_play() {
		// 	return redirect_to_profile_scene_path('');
		// }
		// function redirect_to_dashboard() {
		// 	return redirect_to('dashboard');
		// }

		// function redirect_to_scene_path(path) {
		// 	return redirect_to(`scenes/${window.scene.uuid()}/${path}`);
		// }
		// function redirect_to_profile_scene_path(path) {
		// 	return redirect_to(`${username}/${window.scene.name()}/${path}`);
		// }
		// function redirect_to(path) {
		// 	const url = POLY.root_url() + path;
		// 	// window.location = url
		// 	const link = document.createElement('a');
		// 	link.href = url;

		// 	if (!POLY.desktop_controller().active()) {
		// 		link.setAttribute('target', '_blank');
		// 	}

		// 	// link needs to be added to the DOM for this to work in firefox
		// 	document.body.appendChild(link);
		// 	link.click();
		// 	return document.body.removeChild(link);
		// }

		return {
			display_desktop_entries,
			file_menu_entries,
			edit_menu_entries,
			desktop_menu_entries,
			//functions
			on_file_menu_entry_select,
			on_edit_menu_entry_select,
			on_desktop_menu_entry_select,
		};
	},
});
</script>

<style lang="sass">
@import "globals.sass"

.TopMenu
	background-color: $color_bg_panel
</style>

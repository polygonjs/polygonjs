/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// internal libs

// components
let component;
import DropDownMenu from 'src/Editor/Component/Widget/DropDownMenu';

export default component = {
	name: 'top_menu',
	components: {DropDownMenu},
	props: {
		scene_update_allowed: {
			type: Boolean,
			default: false
		},
		username: {
			type: String,
			default: null
		}
	},

	computed: {
		display_desktop_entries() {
			return POLY.desktop_controller().active();
		},

		file_menu_entries() {
			const entries = [
				{id:'new'},
				{id:'save', disabled: !this.scene_update_allowed},
				{id:'settings', disabled: !this.scene_update_allowed},
				{id:'embed', disabled: !this.scene_update_allowed},
				{id:'play', disabled: !this.scene_update_allowed},
				{id:'dashboard'}
			];

			return entries;
		},

		edit_menu_entries() {
			// I could add a disable state depending on the history stack
			// but not sure that it is reactive yet
			const entries = [
				{id:'undo'},
				{id:'redo'}
			];

			return entries;
		},

		desktop_menu_entries() {
			const entries = [
				{id:'upload_assets', label: 'Upload Assets'},
				{id:'about', label: 'About Desktop'}
			];

			return entries;
		}
	},



	methods: {
		on_file_menu_entry_select(entry){
			switch (entry) {
				case 'new': return this.redirect_to_new_scene();
				case 'save': return this.save();
				case 'settings': return this.redirect_to_settings();
				case 'embed': return this.redirect_to_embed();
				case 'play': return this.redirect_to_play();
				case 'dashboard': return this.redirect_to_dashboard();
				default:
					return window.POLY_alert(`file entry ${entry} not yet implemented`);
			}
		},

		on_edit_menu_entry_select(entry){
			switch (entry) {
				case 'undo': return this.undo();
				case 'redo': return this.redo();
				default:
					return window.POLY_alert(`edit entry ${entry} not yet implemented`);
			}
		},

		on_desktop_menu_entry_select(entry){
			switch (entry) {
				case 'upload_assets': return this.upload_desktop_assets();
				case 'about': return this.open_desktop_about_dialog();
				default:
					return window.POLY_alert(`edit entry ${entry} not yet implemented`);
			}
		},



		save() { return this.$store.app.save_scene(); },
		undo() { return this.$store.history.undo(); },
		redo() { return this.$store.history.redo(); },

		upload_desktop_assets() {
			return POLY.desktop_controller().upload_assets(this.$store.scene, () => {
				return this.save();
			});
		},

		open_desktop_about_dialog() {
			const version = POLY.desktop_controller().version();
			return window.POLY_alert(this, `Polygonjs Desktop App (version ${version})`, {title: "About"});
		},

		redirect_to_new_scene() { 	return this.redirect_to('scenes/new'); },
		redirect_to_settings() { 	return this.redirect_to_scene_path('settings'); },
		redirect_to_embed() { 		return this.redirect_to_scene_path('embed'); },
		redirect_to_play() { 		return this.redirect_to_profile_scene_path(''); },
		redirect_to_dashboard() { 	return this.redirect_to('dashboard'); },

		redirect_to_scene_path(path){
			return this.redirect_to(`scenes/${window.scene.uuid()}/${path}`);
		},
		redirect_to_profile_scene_path(path){
			return this.redirect_to(`${this.username}/${window.scene.name()}/${path}`);
		},
		redirect_to(path){
			const url = POLY.root_url() + path;
			// window.location = url
			const link = document.createElement('a');
			link.href = url;

			if (!POLY.desktop_controller().active()) {
				link.setAttribute('target', "_blank");
			}

			// link needs to be added to the DOM for this to work in firefox
			document.body.appendChild(link);
			link.click();
			return document.body.removeChild(link);
		}
	}
};
# internal libs

# components
import DropDownMenu from 'src/Editor/Component/Widget/DropDownMenu'

export default component =
	name: 'top_menu'
	components: {DropDownMenu}
	props:
		scene_update_allowed:
			type: Boolean
			default: false
		username:
			type: String
			default: null

	computed:
		display_desktop_entries: ->
			POLY.desktop_controller().active()

		file_menu_entries: ->
			entries = [
				{id:'new'}
				{id:'save', disabled: !this.scene_update_allowed}
				{id:'settings', disabled: !this.scene_update_allowed}
				{id:'embed', disabled: !this.scene_update_allowed}
				{id:'play', disabled: !this.scene_update_allowed}
				{id:'dashboard'}
			]

			entries

		edit_menu_entries: ->
			# I could add a disable state depending on the history stack
			# but not sure that it is reactive yet
			entries = [
				{id:'undo'}
				{id:'redo'}
			]

			entries

		desktop_menu_entries: ->
			entries = [
				{id:'upload_assets', label: 'Upload Assets'}
				{id:'about', label: 'About Desktop'}
			]

			entries



	methods:
		on_file_menu_entry_select: (entry)->
			switch entry
				when 'new' then this.redirect_to_new_scene()
				when 'save' then this.save()
				when 'settings' then this.redirect_to_settings()
				when 'embed' then this.redirect_to_embed()
				when 'play' then this.redirect_to_play()
				when 'dashboard' then this.redirect_to_dashboard()
				else
					window.POLY_alert "file entry #{entry} not yet implemented"

		on_edit_menu_entry_select: (entry)->
			switch entry
				when 'undo' then this.undo()
				when 'redo' then this.redo()
				else
					window.POLY_alert "edit entry #{entry} not yet implemented"

		on_desktop_menu_entry_select: (entry)->
			switch entry
				when 'upload_assets' then this.upload_desktop_assets()
				when 'about' then this.open_desktop_about_dialog()
				else
					window.POLY_alert "edit entry #{entry} not yet implemented"



		save: -> this.$store.app.save_scene()
		undo: -> this.$store.history.undo()
		redo: -> this.$store.history.redo()

		upload_desktop_assets: ->
			POLY.desktop_controller().upload_assets this.$store.scene, =>
				this.save()

		open_desktop_about_dialog: ->
			version = POLY.desktop_controller().version()
			window.POLY_alert(this, "Polygonjs Desktop App (version #{version})", {title: "About"})

		redirect_to_new_scene: -> 	this.redirect_to('scenes/new')
		redirect_to_settings: -> 	this.redirect_to_scene_path('settings')
		redirect_to_embed: -> 		this.redirect_to_scene_path('embed')
		redirect_to_play: -> 		this.redirect_to_profile_scene_path('')
		redirect_to_dashboard: -> 	this.redirect_to('dashboard')

		redirect_to_scene_path: (path)->
			this.redirect_to("scenes/#{window.scene.uuid()}/#{path}")
		redirect_to_profile_scene_path: (path)->
			this.redirect_to("#{@username}/#{window.scene.name()}/#{path}")
		redirect_to: (path)->
			url = POLY.root_url() + path
			# window.location = url
			link = document.createElement('a')
			link.href = url

			if !POLY.desktop_controller().active()
				link.setAttribute('target', "_blank")

			# link needs to be added to the DOM for this to work in firefox
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
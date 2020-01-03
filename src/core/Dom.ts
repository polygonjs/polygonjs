const NO_USER_SELECT = 'no_user_select'
const CURSOR_COL_RESIZE = 'cursor_col_resize'

export class CoreDom {
	static add_drag_classes() {
		document.body.classList.add(NO_USER_SELECT)
	}
	static remove_drag_classes() {
		document.body.classList.remove(NO_USER_SELECT)
	}

	static set_cursor_col_resize() {
		document.body.classList.add(CURSOR_COL_RESIZE)
	}
	static unset_cursor_col_resize() {
		document.body.classList.remove(CURSOR_COL_RESIZE)
	}
}

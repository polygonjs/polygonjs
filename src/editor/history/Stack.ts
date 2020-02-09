import {BaseCommand} from './commands/_Base';

export class HistoryStack {
	private static _instance: HistoryStack;
	static instance() {
		return (this._instance = this._instance || new HistoryStack());
	}

	private _commands: BaseCommand[] = [];
	private _index: number = 0;
	private _index_at_scene_save: number = 0;

	private constructor() {}

	get scene_modified(): boolean {
		return this._index != this._index_at_scene_save;
	}
	mark_scene_as_saved() {
		this._index_at_scene_save = this._index;
	}

	push_command(command: BaseCommand) {
		if (this._commands.length > this._index) {
			this._commands = this._commands.splice(0, this._index);
		}

		this._commands.push(command);
		this._index = this._commands.length;

		command.do();
		// console.log("do", this._index, this._commands)
	}

	undo() {
		const command = this._commands[this._index - 1];
		if (command) {
			this._index -= 1;
			command.undo();
		} else {
			console.log('nothing to undo');
		}
		// console.log("undo", this._index, this._commands)
	}

	redo() {
		const command = this._commands[this._index];
		if (command) {
			this._index += 1;
			command.do();
		} else {
			console.log('nothing to redo');
		}
		// console.log("redo", this._index, this._commands)
	}
}

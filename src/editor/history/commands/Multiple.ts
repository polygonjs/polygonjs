import {BaseCommand} from './_Base';

export class MultipleCommand extends BaseCommand {
	private _commands: BaseCommand[] = [];

	push_command(command: BaseCommand) {
		this._commands.push(command);
	}

	do() {
		for (let command of this._commands) {
			command.do();
		}
	}

	undo() {
		for (let i = this._commands.length - 1; i >= 0; i--) {
			this._commands[i].undo();
		}
	}
}

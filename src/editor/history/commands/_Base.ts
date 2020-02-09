import {HistoryStack} from '../Stack';

export abstract class BaseCommand {
	push() {
		HistoryStack.instance().push_command(this);
	}

	abstract do(): void;
	abstract undo(): void;
}

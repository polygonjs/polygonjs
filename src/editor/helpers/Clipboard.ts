export class ClipboardHelper {
	constructor() {}

	static copy(text: string) {
		const input = document.createElement('textarea');
		document.body.appendChild(input);
		input.value = text;
		input.select();
		document.execCommand('copy');
		document.body.removeChild(input);
	}

	copy(text: string) {
		ClipboardHelper.copy(text);
	}
}

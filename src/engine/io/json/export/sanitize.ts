import {CoreString} from '../../../../core/String';

export function sanitizeExportedString(word: string): string {
	word = word.replace(/'/g, "'"); // escapes ' (used to be with 2 /, but now only one to have Ian's Mediation saved and loaded correctly - but is actually 2 in Code Exporter)
	word = CoreString.escapeLineBreaks(word);
	return word;
}

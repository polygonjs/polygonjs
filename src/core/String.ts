import {CoreType} from './Type';
import {ArrayUtils} from './ArrayUtils';

const ATTRIB_NAMES_SEPARATOR = /[, ]/; //[',', ' ']

// const LETTERS = 'abcdefghijklmnopqrstuvwxyz'
// const LETTERS_UPPERCASE = LETTERS.toUpperCase()
// const NUMBERS = '0123645789'
// const ALL = LETTERS + LETTERS_UPPERCASE + NUMBERS

const TAIL_DIGIT_MATCH_REGEXP = /\d+$/;
const LEADING_ZEROS_MATCH_REGEXP = /^0+/;
// const DIGIT_PREDEDED_BY_UNDERSCOPE = /_\d$/
const INDICES_LIST_SEPARATOR = /,| /;
const ZERO = '0';
const SPACE = ' ';

// https://stackoverflow.com/questions/41856126/regexp-optional-dot-in-a-decimal-number
const NUM_REGEXP = /^-?\d+\.?\d*$/;
enum BooleanString {
	TRUE = 'true',
	FALSE = 'false',
}

export class CoreString {
	// static has_tail_digits(word: string): boolean {
	// 	const match = word.match(TAIL_DIGIT_MATCH_REGEXP)
	// 	return (match != null)
	// }
	static isBoolean(word: string): boolean {
		return word == BooleanString.TRUE || word == BooleanString.FALSE;
	}
	static toBoolean(word: string): boolean {
		return word == BooleanString.TRUE;
	}
	static isNumber(word: string): boolean {
		return NUM_REGEXP.test(word);
	}

	static tailDigits(word: string): number {
		const match = word.match(TAIL_DIGIT_MATCH_REGEXP);
		if (match) {
			return parseInt(match[0]);
		} else {
			return 0;
		}
	}

	static increment(word: string): string {
		const match = word.match(TAIL_DIGIT_MATCH_REGEXP);
		if (match) {
			let numbers_as_str = match[0];
			let zeros_prefix: string = '';
			const leading_zeros_match = numbers_as_str.match(LEADING_ZEROS_MATCH_REGEXP);
			if (leading_zeros_match) {
				zeros_prefix = leading_zeros_match[0];
			}

			const digits = parseInt(numbers_as_str);
			if (digits == 0) {
				if (zeros_prefix.length > 0) {
					if (zeros_prefix[zeros_prefix.length - 1] == ZERO) {
						zeros_prefix = zeros_prefix.slice(0, -1);
					}
				}
			}

			const prefix = word.substring(0, word.length - match[0].length);
			return `${prefix}${zeros_prefix}${digits + 1}`;
		} else {
			return `${word}1`;
		}
	}

	static pluralize(word: string): string {
		const last_char = word[word.length - 1];
		if (last_char !== 's') {
			return `${word}s`;
		} else {
			return word;
		}
	}

	static camelCase(str: string): string {
		const elements = str.replace(/_/g, ' ').split(' ');
		let newWord = '';
		for (let i = 0; i < elements.length; i++) {
			let element = elements[i].toLowerCase();
			if (i > 0) {
				element = this.upperFirst(element);
			}
			newWord += element;
		}
		return newWord;

		// inspired from https://blog.bitsrc.io/5-string-manipulation-libraries-for-javascript-5de27e48ee62
		// return str.replace(/_/g, ' ').replace(/(?:^\w|[A-Z0-9]|\b\w|\s+)/g, function (match, index) {
		// 	console.log('match', match, index);
		// 	if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
		// 	return index === 0 ? match.toLowerCase() : match.toUpperCase();
		// });
	}

	static upperFirst(word: string): string {
		const newString = word[0].toUpperCase() + word.substr(1);
		return newString;
	}
	// https://stackoverflow.com/questions/52963900/convert-different-strings-to-snake-case-in-javascript
	// static snake_case(str: string): string {
	// 	return str
	// 		.replace(/\W+/g, ' ')
	// 		.split(/ |\B(?=[A-Z])/)
	// 		.map((word) => word.toLowerCase())
	// 		.join('_');
	// }
	static titleize(word: string): string {
		const elements = word.split(/\s|_/g);
		const newElements = elements.map((elem) => this.upperFirst(elem));
		return newElements.join(' ');
	}

	// static type_to_class_name(word: string): string {
	// 	return this.upperFirst(this.camelCase(word));
	// }

	// static timestamp_to_seconds(word: string): number {
	// 	return Date.parse(word) / 1000;
	// }
	// static seconds_to_timestamp(seconds: number): string {
	// 	const d = new Date();
	// 	d.setTime(seconds * 1000);
	// 	return d.toISOString().substr(11, 8);
	// }

	static precision(val: number, decimals: number = 2): string {
		decimals = Math.max(decimals, 0);
		const elements = `${val}`.split('.');

		if (decimals <= 0) {
			return elements[0];
		}

		let frac = elements[1];
		if (frac !== undefined) {
			if (frac.length > decimals) {
				frac = frac.substring(0, decimals);
			}

			frac = frac.padEnd(decimals, '0');
			return `${elements[0]}.${frac}`;
		} else {
			const string_to_pad = `${val}.`;
			const pad = string_to_pad.length + decimals;
			return string_to_pad.padEnd(pad, '0');
		}
	}

	static ensureFloat(num: number): string {
		// const integer = Math.floor(num)
		// const delta = num - integer
		// if(delta)
		const num_as_string = `${num}`;
		const dot_pos = num_as_string.indexOf('.');
		if (dot_pos >= 0) {
			return num_as_string;
		} else {
			return `${num_as_string}.0`;
		}
	}
	static ensureInteger(num: number): string {
		const num_as_string = `${num}`;
		const dot_pos = num_as_string.indexOf('.');
		if (dot_pos >= 0) {
			return num_as_string.split('.')[0];
		} else {
			return num_as_string;
		}
	}

	// https://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript#32402438
	static matchMask(word: string, mask: string) {
		if (mask === '*') {
			return true;
		}
		if (word == mask) {
			return true;
		}
		const elements = mask.split(SPACE);
		if (elements.length > 1) {
			for (let element of elements) {
				const match = this.matchMask(word, element);
				if (match) {
					return true;
				}
			}
			return false;
		}

		// "."  => Find a single character, except newline or line terminator
		// ".*" => Matches any string that contains zero or more characters
		mask = mask.split('*').join('.*');

		// "^"  => Matches any string with the following at the beginning of it
		// "$"  => Matches any string with that in front at the end of it
		mask = `^${mask}$`;

		// Create a regular expression object for matching string
		const regex = new RegExp(mask);

		// Returns true if it finds a match, otherwise it returns false
		return regex.test(word);
	}
	static matchesOneMask(word: string, masks: string[]): boolean {
		let matches_one_mask = false;
		for (let mask of masks) {
			if (CoreString.matchMask(word, mask)) {
				matches_one_mask = true;
			}
		}
		return matches_one_mask;
	}

	static attribNames(word: string): string[] {
		const elements = word.split(ATTRIB_NAMES_SEPARATOR);
		const names_set: Set<string> = new Set();
		for (let element of elements) {
			element = element.trim();
			if (element.length > 0) {
				names_set.add(element);
			}
		}
		const names: string[] = new Array(names_set.size);
		let i = 0;
		names_set.forEach((name) => {
			names[i] = name;
			i++;
		});
		return names;
	}

	static indices(indices_string: string): number[] {
		const elements = indices_string.split(INDICES_LIST_SEPARATOR);
		if (elements.length > 1) {
			const indices: number[] = elements.flatMap((element) => this.indices(element));
			return ArrayUtils.uniq(indices).sort((a, b) => a - b);
		} else {
			const element = elements[0];
			if (element) {
				const range_separator = '-';
				if (element.indexOf(range_separator) > 0) {
					const range_elements = element.split(range_separator);
					return ArrayUtils.range(parseInt(range_elements[0]), parseInt(range_elements[1]) + 1);
				} else {
					const parsed = parseInt(element);
					if (CoreType.isNumber(parsed)) {
						return [parsed];
					} else {
						return [];
					}
				}
			} else {
				return [];
			}
		}
	}

	static escapeLineBreaks(word: string): string {
		return word.replace(/(\r\n|\n|\r)/gm, '\\n');
	}
	static sanitizeName(name: string): string {
		name = name.replace(/[^A-Za-z0-9]/g, '_');
		name = name.replace(/^[0-9]/, '_'); // replace first char if not a letter
		return name;
	}
}

import {CoreType} from './Type';
import {arrayUniq, range} from './ArrayUtils';
import {arrayPushItems} from './ArrayUtils';

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
const RANGE_SEPARATOR = '-';

// https://stackoverflow.com/questions/41856126/regexp-optional-dot-in-a-decimal-number
const NUM_REGEXP = /^-?\d+\.?\d*$/;
enum BooleanString {
	TRUE = 'true',
	FALSE = 'false',
}
export function stringIsBoolean(word: string): boolean {
	return word == BooleanString.TRUE || word == BooleanString.FALSE;
}
export function stringToBoolean(word: string): boolean {
	return word == BooleanString.TRUE;
}
export function stringIsNumber(word: string): boolean {
	return NUM_REGEXP.test(word);
}
export function sanitizeName(word: string): string {
	word = word.replace(/[^A-Za-z0-9]/g, '_');
	word = word.replace(/^[0-9]/, '_'); // replace first char if not a letter
	return word;
}

let _tmp: string[] = [];
export function stringToAttribNames(word: string, target: string[]): string[] {
	const elements = word.split(ATTRIB_NAMES_SEPARATOR);
	_tmp.length = 0;
	for (const element of elements) {
		const trimmed = element.trim();
		if (trimmed.length > 0) {
			_tmp.push(trimmed);
		}
	}
	arrayUniq(_tmp, target);
	return target;
}
export function stringTailDigits(word: string): number {
	const match = word.match(TAIL_DIGIT_MATCH_REGEXP);
	if (match) {
		return parseInt(match[0]);
	} else {
		return 0;
	}
}
export function stringIncrement(word: string): string {
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
export function stringPluralize(word: string): string {
	const last_char = word[word.length - 1];
	if (last_char !== 's') {
		return `${word}s`;
	} else {
		return word;
	}
}
export function stringCamelCase(str: string): string {
	const elements = str.replace(/_/g, ' ').split(' ');
	let newWord = '';
	for (let i = 0; i < elements.length; i++) {
		let element = elements[i].toLowerCase();
		if (i > 0) {
			element = stringUpperFirst(element);
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
export function stringUpperFirst(word: string): string {
	if (word.length == 0) {
		return word;
	}
	const newString = word[0].toUpperCase() + word.substring(1);
	return newString;
}
export function stringTitleize(word: string): string {
	const elements = word.split(/\s|_/g);
	const newElements = elements.map(stringUpperFirst);
	return newElements.join(' ');
}
export function precision(val: number, decimals: number = 2): string {
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
export function ensureFloat(num: number): string {
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
export function ensureInteger(num: number): string {
	const num_as_string = `${num}`;
	const dot_pos = num_as_string.indexOf('.');
	if (dot_pos >= 0) {
		return num_as_string.split('.')[0];
	} else {
		return num_as_string;
	}
}

// let _elements: string[] = [];
let _exclusionFilters: string[] = [];
// // https://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript#32402438
export function stringMatchMask(word: string, mask: string) {
	if (mask === '*') {
		return true;
	}
	if (word == mask) {
		return true;
	}
	const elements = mask.split(SPACE);
	// const elements = _elements;
	_exclusionFilters.length = 0;
	for (const element of elements) {
		if (element.startsWith('^')) {
			_exclusionFilters.push(element.substring(1));
		}
	}
	// const exclusionFilters = elements
	// 	.filter((element) => element.startsWith('^'))
	// 	.map((element) => element.substring(1));

	for (const exclusionFilter of _exclusionFilters) {
		const match = stringMatchMask(word, exclusionFilter);
		if (match) {
			return false;
		}
	}

	if (elements.length > 1) {
		for (const element of elements) {
			const match = stringMatchMask(word, element);
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

	try {
		// Create a regular expression object for matching string
		const regex = new RegExp(mask);

		// Returns true if it finds a match, otherwise it returns false
		return regex.test(word);
	} catch (err) {
		// we need to wrap in a try catch in case it would create an invalid regex
		return false;
	}
}
export function stringMatchesOneMask(word: string, masks: string[]): boolean {
	for (const mask of masks) {
		if (stringMatchMask(word, mask)) {
			return true;
		}
	}
	return false;
}

let _indices: number[] = [];
let _subIndices: number[] = [];
export function stringToIndices(indicesString: string, target: number[]): number[] {
	target.length = 0;
	const elements = indicesString.split(INDICES_LIST_SEPARATOR);
	if (elements.length > 1) {
		_indices.length = 0;
		for (const element of elements) {
			stringToIndices(element, _subIndices);
			arrayPushItems(_subIndices, _indices);
		}
		// const indices: number[] = elements.flatMap(stringToIndices);
		// const uniqIndices: number[] = [];
		arrayUniq(_indices, target);
		return target.sort((a, b) => a - b);
	} else {
		const element = elements[0];
		if (element) {
			if (element.indexOf(RANGE_SEPARATOR) > 0) {
				const rangeElements = element.split(RANGE_SEPARATOR);
				const rangeStart = rangeElements[0];
				const rangeEnd = rangeElements[1];
				const rangeStartI = parseInt(rangeStart);
				const rangeEndI = parseInt(rangeEnd);
				if (CoreType.isNumberValid(rangeStartI) && CoreType.isNumberValid(rangeEndI)) {
					return range(rangeStartI, rangeEndI + 1, 1, target);
				}
			} else {
				const parsed = parseInt(element);
				if (CoreType.isNumberValid(parsed)) {
					target.push(parsed);
					return target;
				}
			}
		}
	}
	return target;
}
export function stringEscapeLineBreaks(word: string): string {
	return word.replace(/(\r\n|\n|\r)/gm, '\\n');
}
export class CoreString {
	static isBoolean = stringIsBoolean;
	static toBoolean = stringToBoolean;
	static isNumber = stringIsNumber;
	static tailDigits = stringTailDigits;
	static increment = stringIncrement;
	static pluralize = stringPluralize;
	static camelCase = stringCamelCase;
	static upperFirst = stringUpperFirst;
	static titleize = stringTitleize;
	static precision = precision;
	static ensureFloat = ensureFloat;
	static ensureInteger = ensureInteger;
	static matchMask = stringMatchMask;
	static matchesOneMask = stringMatchesOneMask;
	static attribNames = stringToAttribNames;
	static indices = stringToIndices;
	static escapeLineBreaks = stringEscapeLineBreaks;
	static sanitizeName = sanitizeName;
}

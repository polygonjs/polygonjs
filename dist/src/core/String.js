import lodash_range from "lodash/range";
import lodash_uniq from "lodash/uniq";
import lodash_trim from "lodash/trim";
import lodash_compact from "lodash/compact";
import lodash_flatten from "lodash/flatten";
import lodash_padEnd from "lodash/padEnd";
import lodash_capitalize from "lodash/capitalize";
import lodash_snakeCase from "lodash/snakeCase";
import lodash_upperFirst from "lodash/upperFirst";
import lodash_camelCase from "lodash/camelCase";
import lodash_isNumber from "lodash/isNumber";
const ATTRIB_NAMES_SEPARATOR = /[, ]/;
const TAIL_DIGIT_MATCH_REGEXP = /\d+$/;
const LEADING_ZEROS_MATCH_REGEXP = /^0+/;
const INDICES_LIST_SEPARATOR = /,| /;
const ZERO = "0";
const SPACE = " ";
const NUM_REGEXP = /^-?\d+\.?\d*$/;
var BooleanString;
(function(BooleanString2) {
  BooleanString2["TRUE"] = "true";
  BooleanString2["FALSE"] = "false";
})(BooleanString || (BooleanString = {}));
export class CoreString {
  static is_boolean(word) {
    return word == BooleanString.TRUE || word == BooleanString.FALSE;
  }
  static to_boolean(word) {
    return word == BooleanString.TRUE;
  }
  static is_number(word) {
    return NUM_REGEXP.test(word);
  }
  static tail_digits(word) {
    const match = word.match(TAIL_DIGIT_MATCH_REGEXP);
    if (match) {
      return parseInt(match[0]);
    } else {
      return 0;
    }
  }
  static increment(word) {
    const match = word.match(TAIL_DIGIT_MATCH_REGEXP);
    if (match) {
      let numbers_as_str = match[0];
      let zeros_prefix = "";
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
  static pluralize(word) {
    const last_char = word[word.length - 1];
    if (last_char !== "s") {
      return `${word}s`;
    } else {
      return word;
    }
  }
  static camel_case(word) {
    return lodash_camelCase(word);
  }
  static upper_first(word) {
    return lodash_upperFirst(word);
  }
  static snake_case(word) {
    return lodash_snakeCase(word);
  }
  static titleize(word) {
    return lodash_capitalize(word.replace(/_/g, " "));
  }
  static type_to_class_name(word) {
    return this.upper_first(lodash_camelCase(word));
  }
  static timestamp_to_seconds(word) {
    return Date.parse(word) / 1e3;
  }
  static seconds_to_timestamp(seconds) {
    const d = new Date();
    d.setTime(seconds * 1e3);
    return d.toISOString().substr(11, 8);
  }
  static precision(val, decimals = 2) {
    decimals = Math.max(decimals, 0);
    const elements = `${val}`.split(".");
    if (decimals <= 0) {
      return elements[0];
    }
    let frac = elements[1];
    if (frac !== void 0) {
      if (frac.length > decimals) {
        frac = frac.substring(0, decimals);
      }
      frac = lodash_padEnd(frac, decimals, "0");
      return `${elements[0]}.${frac}`;
    } else {
      const string_to_pad = `${val}.`;
      const pad = string_to_pad.length + decimals;
      return lodash_padEnd(string_to_pad, pad, "0");
    }
  }
  static ensure_float(num) {
    const num_as_string = `${num}`;
    const dot_pos = num_as_string.indexOf(".");
    if (dot_pos >= 0) {
      return num_as_string;
    } else {
      return `${num_as_string}.0`;
    }
  }
  static match_mask(word, mask) {
    if (mask === "*") {
      return true;
    }
    const elements = mask.split(SPACE);
    if (elements.length > 1) {
      for (let element of elements) {
        const match = this.match_mask(word, element);
        if (match) {
          return true;
        }
      }
      return false;
    }
    mask = mask.split("*").join(".*");
    mask = `^${mask}$`;
    const regex = new RegExp(mask);
    return regex.test(word);
  }
  static matches_one_mask(word, masks) {
    let matches_one_mask = false;
    for (let mask of masks) {
      if (CoreString.match_mask(word, mask)) {
        matches_one_mask = true;
      }
    }
    return matches_one_mask;
  }
  static attrib_names(word) {
    const elements = word.split(ATTRIB_NAMES_SEPARATOR);
    const trimed_elements = lodash_compact(elements.map((e) => {
      return lodash_trim(e);
    }));
    const uniq2 = lodash_uniq(trimed_elements);
    return uniq2;
  }
  static to_id(val) {
    if (val == null) {
      return 0;
    }
    const elements = val.split("").reverse();
    let id = 0;
    let exp = 0;
    elements.forEach((element, i) => {
      let index = element.charCodeAt(0);
      if (index >= 0) {
        exp = i % 10;
        id += index * 10 ** exp;
        id = id % Number.MAX_SAFE_INTEGER;
      }
    });
    return id;
  }
  static indices(indices_string) {
    const elements = indices_string.split(INDICES_LIST_SEPARATOR);
    if (elements.length > 1) {
      return lodash_uniq(lodash_flatten(elements.map((element) => this.indices(element)))).sort((a, b) => a - b);
    } else {
      const element = elements[0];
      if (element) {
        const range_separator = "-";
        if (element.indexOf(range_separator) > 0) {
          const range_elements = element.split(range_separator);
          return lodash_range(parseInt(range_elements[0]), parseInt(range_elements[1]) + 1);
        } else {
          const parsed = parseInt(element);
          if (lodash_isNumber(parsed)) {
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
  static escape_line_breaks(word) {
    return word.replace(/(\r\n|\n|\r)/gm, "\\n");
  }
}

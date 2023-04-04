import {_matchArrayLengthWithType} from './_ArrayUtils';

export enum FunctionUtils {
	MATCH_ARRAY_LENGTH_WITH_TYPE = '_matchArrayLengthWithType',
}

const FUNCTION_UTILS_DICT: Record<FunctionUtils, Function> = {
	[FunctionUtils.MATCH_ARRAY_LENGTH_WITH_TYPE]: _matchArrayLengthWithType,
};

const FUNCTION_UTILS_NAMES = Object.keys(FUNCTION_UTILS_DICT) as FunctionUtils[];
const FUNCTION_UTILS_FUNCTIONS = FUNCTION_UTILS_NAMES.map((functionName) => FUNCTION_UTILS_DICT[functionName]);
export const FUNCTION_UTILS = {
	names: FUNCTION_UTILS_NAMES,
	functions: FUNCTION_UTILS_FUNCTIONS,
};

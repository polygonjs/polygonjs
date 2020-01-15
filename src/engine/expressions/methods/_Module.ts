// TODO: create an expression object that knows how many args it can accept, their type
// and can throw an error and give it to the param, and then to the node
// TODO: the expression should know how to update the node dependencies

// import abs from './abs'
// import {Asset} from './asset'
import {Bbox} from './bbox';
// import ceil from './ceil'
import {Centroid} from './centroid';
import {Ch} from './ch';
import {Copy} from './copy';
import {CopRes} from './cop_res';
// import clamp from './clamp'
// import {Easein} from './easein'
// import {Easeinout} from './easeinout'
// import floor from './floor'
// import humanize from './humanize'
import {Local} from './local';
// import if_ from './if'
// import max from './max'
// import min from './min'
import {Opdigits} from './opdigits';
// import object from './object'
// import objects_count from './objects_count'
// import objects_visible_count from './objects_visible_count'
import {Point} from './point';
import {PointsCount} from './points_count';
// import {Precision} from './precision'
// import rand from './rand'
// import round from './round'
// import sign from './sign'
import {StrCharsCount} from './str_chars_count';
import {StrConcat} from './str_concat';
import {StrIndex} from './str_index';
import {StrSub} from './str_sub';

export const MethodModule = {
	// 'asset': Asset,
	bbox: Bbox,
	ch: Ch,
	centroid: Centroid,
	cop_res: CopRes,
	local: Local,
	opdigits: Opdigits,
	point: Point,
	points_count: PointsCount,
	// 'precision': Precision,
	copy: Copy,
	str_chars_count: StrCharsCount,
	str_concat: StrConcat,
	str_index: StrIndex,
	str_sub: StrSub,
};

// import cos from './cos'
// import sin from './sin'

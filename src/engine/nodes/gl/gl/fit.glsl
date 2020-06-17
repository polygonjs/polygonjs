//
//
// FIT
//
//
float fit(float val, float src_min, float src_max, float dest_min, float dest_max){
	float  src_range = src_max - src_min;
	float dest_range = dest_max - dest_min;

	float r = (val - src_min) / src_range;
	return (r * dest_range) + dest_min;
}
vec2 fit(vec2 val, vec2 src_min, vec2 src_max, vec2 dest_min, vec2 dest_max){
	return vec2(
		fit(val.x, src_min.x, src_max.x, dest_min.x, dest_max.x),
		fit(val.y, src_min.y, src_max.y, dest_min.y, dest_max.y)
	);
}
vec3 fit(vec3 val, vec3 src_min, vec3 src_max, vec3 dest_min, vec3 dest_max){
	return vec3(
		fit(val.x, src_min.x, src_max.x, dest_min.x, dest_max.x),
		fit(val.y, src_min.y, src_max.y, dest_min.y, dest_max.y),
		fit(val.z, src_min.z, src_max.z, dest_min.z, dest_max.z)
	);
}
vec4 fit(vec4 val, vec4 src_min, vec4 src_max, vec4 dest_min, vec4 dest_max){
	return vec4(
		fit(val.x, src_min.x, src_max.x, dest_min.x, dest_max.x),
		fit(val.y, src_min.y, src_max.y, dest_min.y, dest_max.y),
		fit(val.z, src_min.z, src_max.z, dest_min.z, dest_max.z),
		fit(val.w, src_min.w, src_max.w, dest_min.w, dest_max.w)
	);
}

//
//
// FIT TO 01
// fits the range [src_min, src_max] to [0, 1]
//
float fit_to_01(float val, float src_min, float src_max){
	float size = src_max - src_min;
	return (val - src_min) / size;
}
vec2 fit_to_01(vec2 val, vec2 src_min, vec2 src_max){
	return vec2(
		fit_to_01(val.x, src_min.x, src_max.x),
		fit_to_01(val.y, src_min.y, src_max.y)
	);
}
vec3 fit_to_01(vec3 val, vec3 src_min, vec3 src_max){
	return vec3(
		fit_to_01(val.x, src_min.x, src_max.x),
		fit_to_01(val.y, src_min.y, src_max.y),
		fit_to_01(val.z, src_min.z, src_max.z)
	);
}
vec4 fit_to_01(vec4 val, vec4 src_min, vec4 src_max){
	return vec4(
		fit_to_01(val.x, src_min.x, src_max.x),
		fit_to_01(val.y, src_min.y, src_max.y),
		fit_to_01(val.z, src_min.z, src_max.z),
		fit_to_01(val.w, src_min.w, src_max.w)
	);
}

//
//
// FIT FROM 01
// fits the range [0, 1] to [dest_min, dest_max]
//
float fit_from_01(float val, float dest_min, float dest_max){
	return fit(val, 0.0, 1.0, dest_min, dest_max);
}
vec2 fit_from_01(vec2 val, vec2 src_min, vec2 src_max){
	return vec2(
		fit_from_01(val.x, src_min.x, src_max.x),
		fit_from_01(val.y, src_min.y, src_max.y)
	);
}
vec3 fit_from_01(vec3 val, vec3 src_min, vec3 src_max){
	return vec3(
		fit_from_01(val.x, src_min.x, src_max.x),
		fit_from_01(val.y, src_min.y, src_max.y),
		fit_from_01(val.z, src_min.z, src_max.z)
	);
}
vec4 fit_from_01(vec4 val, vec4 src_min, vec4 src_max){
	return vec4(
		fit_from_01(val.x, src_min.x, src_max.x),
		fit_from_01(val.y, src_min.y, src_max.y),
		fit_from_01(val.z, src_min.z, src_max.z),
		fit_from_01(val.w, src_min.w, src_max.w)
	);
}

//
//
// FIT FROM 01 TO VARIANCE
// fits the range [0, 1] to [center - variance, center + variance]
//
float fit_from_01_to_variance(float val, float center, float variance){
	return fit_from_01(val, center - variance, center + variance);
}
vec2 fit_from_01_to_variance(vec2 val, vec2 center, vec2 variance){
	return vec2(
		fit_from_01_to_variance(val.x, center.x, variance.x),
		fit_from_01_to_variance(val.y, center.y, variance.y)
	);
}
vec3 fit_from_01_to_variance(vec3 val, vec3 center, vec3 variance){
	return vec3(
		fit_from_01_to_variance(val.x, center.x, variance.x),
		fit_from_01_to_variance(val.y, center.y, variance.y),
		fit_from_01_to_variance(val.z, center.z, variance.z)
	);
}
vec4 fit_from_01_to_variance(vec4 val, vec4 center, vec4 variance){
	return vec4(
		fit_from_01_to_variance(val.x, center.x, variance.x),
		fit_from_01_to_variance(val.y, center.y, variance.y),
		fit_from_01_to_variance(val.z, center.z, variance.z),
		fit_from_01_to_variance(val.w, center.w, variance.w)
	);
}
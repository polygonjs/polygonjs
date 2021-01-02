//
//
// FIT
//
//
float fit(float val, float srcMin, float srcMax, float destMin, float destMax){
	float src_range = srcMax - srcMin;
	float dest_range = destMax - destMin;

	float r = (val - srcMin) / src_range;
	return (r * dest_range) + destMin;
}
vec2 fit(vec2 val, vec2 srcMin, vec2 srcMax, vec2 destMin, vec2 destMax){
	return vec2(
		fit(val.x, srcMin.x, srcMax.x, destMin.x, destMax.x),
		fit(val.y, srcMin.y, srcMax.y, destMin.y, destMax.y)
	);
}
vec3 fit(vec3 val, vec3 srcMin, vec3 srcMax, vec3 destMin, vec3 destMax){
	return vec3(
		fit(val.x, srcMin.x, srcMax.x, destMin.x, destMax.x),
		fit(val.y, srcMin.y, srcMax.y, destMin.y, destMax.y),
		fit(val.z, srcMin.z, srcMax.z, destMin.z, destMax.z)
	);
}
vec4 fit(vec4 val, vec4 srcMin, vec4 srcMax, vec4 destMin, vec4 destMax){
	return vec4(
		fit(val.x, srcMin.x, srcMax.x, destMin.x, destMax.x),
		fit(val.y, srcMin.y, srcMax.y, destMin.y, destMax.y),
		fit(val.z, srcMin.z, srcMax.z, destMin.z, destMax.z),
		fit(val.w, srcMin.w, srcMax.w, destMin.w, destMax.w)
	);
}

//
//
// FIT TO 01
// fits the range [srcMin, srcMax] to [0, 1]
//
float fit_to_01(float val, float srcMin, float srcMax){
	float size = srcMax - srcMin;
	return (val - srcMin) / size;
}
vec2 fit_to_01(vec2 val, vec2 srcMin, vec2 srcMax){
	return vec2(
		fit_to_01(val.x, srcMin.x, srcMax.x),
		fit_to_01(val.y, srcMin.y, srcMax.y)
	);
}
vec3 fit_to_01(vec3 val, vec3 srcMin, vec3 srcMax){
	return vec3(
		fit_to_01(val.x, srcMin.x, srcMax.x),
		fit_to_01(val.y, srcMin.y, srcMax.y),
		fit_to_01(val.z, srcMin.z, srcMax.z)
	);
}
vec4 fit_to_01(vec4 val, vec4 srcMin, vec4 srcMax){
	return vec4(
		fit_to_01(val.x, srcMin.x, srcMax.x),
		fit_to_01(val.y, srcMin.y, srcMax.y),
		fit_to_01(val.z, srcMin.z, srcMax.z),
		fit_to_01(val.w, srcMin.w, srcMax.w)
	);
}

//
//
// FIT FROM 01
// fits the range [0, 1] to [destMin, destMax]
//
float fit_from_01(float val, float destMin, float destMax){
	return fit(val, 0.0, 1.0, destMin, destMax);
}
vec2 fit_from_01(vec2 val, vec2 srcMin, vec2 srcMax){
	return vec2(
		fit_from_01(val.x, srcMin.x, srcMax.x),
		fit_from_01(val.y, srcMin.y, srcMax.y)
	);
}
vec3 fit_from_01(vec3 val, vec3 srcMin, vec3 srcMax){
	return vec3(
		fit_from_01(val.x, srcMin.x, srcMax.x),
		fit_from_01(val.y, srcMin.y, srcMax.y),
		fit_from_01(val.z, srcMin.z, srcMax.z)
	);
}
vec4 fit_from_01(vec4 val, vec4 srcMin, vec4 srcMax){
	return vec4(
		fit_from_01(val.x, srcMin.x, srcMax.x),
		fit_from_01(val.y, srcMin.y, srcMax.y),
		fit_from_01(val.z, srcMin.z, srcMax.z),
		fit_from_01(val.w, srcMin.w, srcMax.w)
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
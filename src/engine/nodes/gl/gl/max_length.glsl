//
//
// CLAMP_LENGTH
//
//
float maxLength(float val, float max_l){
	return min(val, max_l);
}
vec2 maxLength(vec2 val, float max_l){
	float vec_length = length(val);
	if(vec_length == 0.0){
		return val;
	} else {
		float new_length = min(vec_length, max_l);
		return new_length * normalize(val);
	}
}
vec3 maxLength(vec3 val, float max_l){
	float vec_length = length(val);
	if(vec_length == 0.0){
		return val;
	} else {
		float new_length = min(vec_length, max_l);
		return new_length * normalize(val);
	}
}
vec4 maxLength(vec4 val, float max_l){
	float vec_length = length(val);
	if(vec_length == 0.0){
		return val;
	} else {
		float new_length = min(vec_length, max_l);
		return new_length * normalize(val);
	}
}

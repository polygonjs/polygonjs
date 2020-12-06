//
//
// CLAMP_LENGTH
//
//
float max_length(float val, float max_l){
	return min(val, max_l);
}
vec2 max_length(vec2 val, float max_l){
	float vec_length = length(val);
	if(vec_length == 0.0){
		return val;
	} else {
		float new_length = min(vec_length, max_l);
		return new_length * normalize(val);
	}
}
vec3 max_length(vec3 val, float max_l){
	float vec_length = length(val);
	if(vec_length == 0.0){
		return val;
	} else {
		float new_length = min(vec_length, max_l);
		return new_length * normalize(val);
	}
}
vec4 max_length(vec4 val, float max_l){
	float vec_length = length(val);
	if(vec_length == 0.0){
		return val;
	} else {
		float new_length = min(vec_length, max_l);
		return new_length * normalize(val);
	}
}

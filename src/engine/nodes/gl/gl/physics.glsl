float velFromAccel(float vel, float force, float mass, float time_delta){
	float impulse = (time_delta * mass) * force;
	return vel + impulse;
}
vec2 velFromAccel(vec2 vel, vec2 force, float mass, float time_delta){
	vec2 impulse = (time_delta * mass) * force;
	return vel + impulse;
}
vec3 velFromAccel(vec3 vel, vec3 force, float mass, float time_delta){
	vec3 impulse = (time_delta * mass) * force;
	return vel + impulse;
}
vec4 velFromAccel(vec4 vel, vec4 force, float mass, float time_delta){
	vec4 impulse = (time_delta * mass) * force;
	return vel + impulse;
}
float posFromVel(float position, float velocity, float time_delta){
	return position + (time_delta * velocity);
}
vec2 posFromVel(vec2 position, vec2 velocity, float time_delta){
	return position + (time_delta * velocity);
}
vec3 posFromVel(vec3 position, vec3 velocity, float time_delta){
	return position + (time_delta * velocity);
}
vec4 posFromVel(vec4 position, vec4 velocity, float time_delta){
	return position + (time_delta * velocity);
}
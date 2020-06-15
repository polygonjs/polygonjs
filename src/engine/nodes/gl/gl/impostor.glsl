// ANGLE_NORMALIZER = 1 / (2*PI)
# define IMPOSTOR_UV_ANGLE_NORMALIZER 0.15915494309189535
vec2 impostor_uv(vec3 center, vec3 camera_pos, vec2 imp_uv, float tiles_count, float offset){
	imp_uv.x /= tiles_count;

	camera_pos.y = center.y;
	vec3 delta = normalize(center - camera_pos);
	vec3 angle_start = vec3(-1.0,0.0,0.0);
	float angle = vector_angle(delta, angle_start) + offset;
	angle *= IMPOSTOR_UV_ANGLE_NORMALIZER;
	angle *= tiles_count;
	angle = floor(angle);
	angle /= tiles_count;
	imp_uv.x -= angle;

	return imp_uv;
}

float disk_feather(float dist, float radius, float feather){
	if(feather <= 0.0){
		if(dist < radius){return 1.0;}else{return 0.0;}
	} else {
		float half_feather = feather * 0.5;
		if(dist < (radius - half_feather)){
			return 1.0;
		} else {
			if(dist > (radius + half_feather)){
				return 0.0;
			} else {
				float feather_start = (radius - half_feather);
				float blend = 1.0 - (dist - feather_start) / feather;
				return blend;
			}
		}
	}
}

float disk2d(vec2 pos, vec2 center, float radius, float feather){
	float dist = distance(pos, center);
	return disk_feather(dist, radius, feather);
}

// function could be called sphere, but is an overload of disk, and is the same
float disk3d(vec3 pos, vec3 center, float radius, float feather){
	float dist = distance(pos, center);
	return disk_feather(dist, radius, feather);
}
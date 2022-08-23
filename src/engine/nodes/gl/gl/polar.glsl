vec3 cartesianToPolar(vec3 w){
	float wr = sqrt(dot(w,w));
	float wo = acos(w.y/wr);
	float wi = atan(w.x,w.z);
	return vec3(wr,wo,wi);
}
vec3 polarToCartesian(vec3 p){
	float x = p.x * sin(p.y)*sin(p.z);
	float y = p.x * cos(p.y);
	float z = p.x * sin(p.y)*cos(p.z);
	return vec3(x,y,z);
}
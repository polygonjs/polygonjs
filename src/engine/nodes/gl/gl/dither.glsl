const vec4 ditherVec0 = vec4(0.0,  8.0,  2.0,  10.0);
const vec4 ditherVec1 = vec4(12.0, 4.0,  14.0, 6.0);
const vec4 ditherVec2 = vec4(3.0,  11.0, 1.0,  9.0);
const vec4 ditherVec3 = vec4(15.0, 7.0,  13.0, 5.0);
float vec4Component(vec4 v, int y){
	if(y == 0){
		return v.x;
	} else if(y == 1){
		return v.y;
	} else if(y == 2){
		return v.z;
	}
	return v.w;
}
float indexValue() {
	int x = int(mod(gl_FragCoord.x, 4.0));
	int y = int(mod(gl_FragCoord.y, 4.0));
	if(x == 0){
		return vec4Component(ditherVec0, y);
	} else if(x == 1){
		return vec4Component(ditherVec1, y);
	} else if(x == 2){
		return vec4Component(ditherVec2, y);
	}
	return vec4Component(ditherVec3, y);
}
float computeDither(float alpha, float alphaTest) {
	float closestColor = (alpha < alphaTest) ? 0.0 : 1.0;
	float secondClosestColor = 1.0 - closestColor;
	float d = indexValue();
	float distance = abs(closestColor - alpha);
	return (distance < d) ? closestColor : secondClosestColor;
}
float dither(float alpha, float alphaTest) {
	if( alpha <= 0.0 ){ discard; }
	if( alpha < 1.0 ) { alpha = computeDither(alpha, alphaTest); }
	if( alpha < 0.5 ) { discard; }
	return alpha;
}
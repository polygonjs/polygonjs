// https://www.shadertoy.com/view/Xdlczl
#define DRAG_MULT 0.048
#define ITERATIONS_NORMAL 48
vec2 wavedx(vec2 position, vec2 direction, float speed, float frequency, float timeshift) {
	float x = dot(direction, position) * frequency + timeshift * speed;
	float wave = exp(sin(x) - 1.0);
	float dx = wave * cos(x);
	return vec2(wave, -dx);
}
float getwaves(vec2 position, float currentTime, float freq, float freqMult, float speedMult){
	float iter = 0.0;
	float speed = 2.0;
	float weight = 1.0;
	float w = 0.0;
	float ws = 0.0;
	for(int i=0;i<ITERATIONS_NORMAL;i++){
		vec2 p = vec2(sin(iter), cos(iter));
		vec2 res = wavedx(position, p, speed, freq, currentTime);
		position += p * res.y * weight * DRAG_MULT;
		w += res.x * weight;
		iter += 12.0;
		ws += weight;
		weight = mix(weight, 0.0, 0.2);
		freq *= freqMult;
		speed *= speedMult;
	}
	return (w / ws);
}
uniform sampler2D mirrorSampler;
uniform float alpha;
uniform float time;
uniform float timeScale;
uniform float size;
uniform float distortionScale;
uniform float normalBias;
// uniform sampler2D normalSampler;
uniform vec3 sunColor;
uniform vec3 sunDirection;
uniform vec3 eye;
uniform float wavesHeight;
uniform vec3 waterColor;
uniform vec3 reflectionColor;
uniform float reflectionFresnel;
uniform vec3 direction;

varying vec4 mirrorCoord;
varying vec4 worldPosition;
varying vec2 geoUV;

// vec4 getNoise( vec2 uv ) {
// 	float t = time * timeScale;
// 	vec2 uv0 = ( uv / 103.0 ) + vec2(t / 17.0, t / 29.0);
// 	vec2 uv1 = uv / 107.0-vec2( t / -19.0, t / 31.0 );
// 	vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( t / 101.0, t / 97.0 );
// 	vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( t / 109.0, t / -113.0 );
// 	vec4 noise = texture2D( normalSampler, uv0 ) +
// 		texture2D( normalSampler, uv1 ) +
// 		texture2D( normalSampler, uv2 ) +
// 		texture2D( normalSampler, uv3 );
// 	return noise * 0.5 - 1.0;
// }

// from https://www.shadertoy.com/view/MdXyzX
// https://www.shadertoy.com/view/Xdlczl
#define DRAG_MULT 0.048
#define ITERATIONS_NORMAL 48
vec2 wavedx(vec2 position, vec2 direction, float speed, float frequency, float timeshift) {
	float x = dot(direction, position) * frequency + timeshift * speed;
	float wave = exp(sin(x) - 1.0);
	float dx = wave * cos(x);
	return vec2(wave, -dx);
	// return vec2(1.0,0.0);
}

float getwaves(vec2 position, float currentTime){
	float iter = 0.0;
	float phase = 6.0;
	float speed = 2.0;
	float weight = 1.0;
	float w = 0.0;
	float ws = 0.0;
	for(int i=0;i<ITERATIONS_NORMAL;i++){
		vec2 p = vec2(sin(iter), cos(iter));
		vec2 res = wavedx(position, p, speed, phase, currentTime);
		position += p * res.y * weight * DRAG_MULT;
		w += res.x * weight;
		iter += 12.0;
		ws += weight;
		weight = mix(weight, 0.0, 0.2);
		phase *= 1.18;
		speed *= 1.07;
	}
	return w / ws;
	// return 1.0;
}

float H = 0.0;
vec3 normal(vec2 pos, float e, float depth, float currentTime){
	vec2 ex = vec2(e, 0);
	H = getwaves(pos.xy * 0.1, currentTime) * depth;
	vec3 a = vec3(pos.x, H, pos.y);
	return normalize(cross(a-vec3(pos.x - e, getwaves(pos.xy * 0.1 - ex.xy * 0.1, currentTime) * depth, pos.y),
						a-vec3(pos.x, getwaves(pos.xy * 0.1 + ex.yx * 0.1, currentTime) * depth, pos.y + e)));
}


void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
	vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
	float direction = max( 0.0, dot( eyeDirection, reflection ) );
	specularColor += pow( direction, shiny ) * sunColor * spec;
	diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
}



#include <common>
#include <packing>
#include <bsdfs>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

void main() {

	#include <logdepthbuf_fragment>
	float waterDepth = -wavesHeight;
	vec3 surfaceNormal = normal(geoUV * size, normalBias /*0.01*/, waterDepth, time * timeScale);

	vec3 diffuseLight = vec3(0.0);
	vec3 specularLight = vec3(0.0);

	vec3 worldToEye = eye-worldPosition.xyz;
	vec3 eyeDirection = normalize( worldToEye );
	sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

	float distance = length(worldToEye);

	vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
	vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );

	float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
	float rf0 = 0.05;
	float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 2.0 );//rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
	reflectance = mix(1.0, reflectance, reflectionFresnel);
	vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
	vec3 reflection = ( vec3( 0.0 ) + reflectionSample * 0.9 + reflectionSample * specularLight ) * reflectionColor;
	vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), reflection, reflectance);
	vec3 outgoingLight = albedo;
	gl_FragColor = vec4( outgoingLight, 1.0 );

	#include <tonemapping_fragment>
	#include <fog_fragment>
}
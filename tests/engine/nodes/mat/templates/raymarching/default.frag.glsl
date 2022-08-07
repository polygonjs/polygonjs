precision highp float;
precision highp int;
#include <common>
float sdSphere( vec3 p, float s )
{
	return length(p)-s;
}
float sdBox( vec3 p, vec3 b )
{
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float SDFUnion( float d1, float d2 ) { return min(d1,d2); }
float SDFSubtract( float d1, float d2 ) { return max(-d1,d2); }
float SDFIntersect( float d1, float d2 ) { return max(d1,d2); }
float SDFSmoothUnion( float d1, float d2, float k ) {
	float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) - k*h*(1.0-h);
}
float SDFSmoothSubtract( float d1, float d2, float k ) {
	float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
	return mix( d2, -d1, h ) + k*h*(1.0-h);
}
float SDFSmoothIntersect( float d1, float d2, float k ) {
	float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) + k*h*(1.0-h);
}
const int _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1 = 147;
uniform sampler2D v_POLY_texture_envTexture1;
#include <lightmap_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
uniform int MAX_STEPS;
uniform float MAX_DIST;
uniform float SURF_DIST;
#define ZERO 0
varying vec3 vPw;
#if NUM_SPOT_LIGHTS > 0
	struct SpotLightRayMarching {
		vec3 worldPos;
	};
	uniform SpotLightRayMarching spotLightsRayMarching[ NUM_SPOT_LIGHTS ];
#endif
struct SDFContext {
	float d;
	int matId;
};
SDFContext DefaultSDFContext(){
	return SDFContext( 0.0, 0 );
}
int DefaultSDFMaterial(){
	return 0;
}
SDFContext GetDist(vec3 p) {
	SDFContext sdfContext = SDFContext(0.0, 0);
	vec3 v_POLY_globals1_position = p;
	
	float v_POLY_SDFSphere1_float = sdSphere(v_POLY_globals1_position - vec3(0.0, 0.0, 0.0), 1.0);
	
	SDFContext v_POLY_SDFContext1_SDFContext = SDFContext(v_POLY_SDFSphere1_float, _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1);
	
	sdfContext = v_POLY_SDFContext1_SDFContext;
	
	return sdfContext;
}
SDFContext RayMarch(vec3 ro, vec3 rd) {
	SDFContext dO = SDFContext(0.,0);
	for(int i=0; i<MAX_STEPS; i++) {
		vec3 p = ro + rd*dO.d;
		SDFContext sdfContext = GetDist(p);
		dO.d += sdfContext.d;
		dO.matId = sdfContext.matId;
		if(dO.d>MAX_DIST || sdfContext.d<SURF_DIST) break;
	}
	return dO;
}
vec3 GetNormal(vec3 p) {
	SDFContext sdfContext = GetDist(p);
	vec2 e = vec2(.01, 0);
	vec3 n = sdfContext.d - vec3(
		GetDist(p-e.xyy).d,
		GetDist(p-e.yxy).d,
		GetDist(p-e.yyx).d);
	return normalize(n);
}
vec3 GetLight(vec3 p, vec3 n) {
	#if NUM_SPOT_LIGHTS > 0
		vec3 dif = vec3(0.,0.,0.);
		SpotLightRayMarching spotLightRayMarching;
		SpotLight spotLight;
		vec3 lightPos,lightCol, l;
		float lighDif;
		SDFContext sdfContext;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
			spotLightRayMarching = spotLightsRayMarching[ i ];
			spotLight = spotLights[ i ];
			lightPos = spotLightRayMarching.worldPos;
			lightCol = spotLight.color;
			l = normalize(lightPos-p);
			lighDif = clamp(dot(n, l), 0., 1.);
			sdfContext = RayMarch(p+n*SURF_DIST*2., l);
			if(sdfContext.d<length(lightPos-p)) lighDif *= .1;
			dif += lightCol * lighDif;
		}
		#pragma unroll_loop_end
		return dif;
	#else
		return vec3(1.0, 1.0, 1.0);
	#endif
}
float calcSoftshadow( in vec3 ro, in vec3 rd, float mint, float maxt, float k )
{
	float res = 1.0;
	float ph = 1e20;
	for( float t=mint; t<maxt; )
	{
		float h = GetDist(ro + rd*t).d;
		if( h<0.001 )
			return 0.0;
		float y = h*h/(2.0*ph);
		float d = sqrt(h*h-y*y);
		res = min( res, k*d/max(0.0,t-y) );
		ph = h;
		t += h;
	}
	return res;
}
vec3 applyMaterial(vec3 p, vec3 n, vec3 rayDir, vec3 col, int mat){
	vec3 v_POLY_constant1_val = vec3(1.0, 1.0, 1.0);
	
	if(mat == _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1){
			col *= v_POLY_constant1_val;
			if(false){
				vec3 r = normalize(reflect(rayDir, n));
				vec2 uv;
				uv.x = atan( -r.z, -r.x ) * RECIPROCAL_PI2 + 0.5;
				uv.y = r.y * 0.5 + 0.5;
				vec3 env = texture2D(v_POLY_texture_envTexture1, uv).rgb;
				col += env;
			}
		}
	
	return col;
}
vec4 applyShading(vec3 rayOrigin, vec3 rayDir, SDFContext sdfContext){
	vec3 p = rayOrigin + rayDir * sdfContext.d;
	vec3 n = GetNormal(p);
	vec3 diffuse = GetLight(p, n);
	vec3 col = applyMaterial(p, n, rayDir, diffuse, sdfContext.matId);
		
	col = pow( col, vec3(0.4545) ); 
	return vec4(col, 1.);
}
void main()	{
	vec3 rayDir = normalize(vPw - cameraPosition);
	vec3 rayOrigin = cameraPosition;
	SDFContext sdfContext = RayMarch(rayOrigin, rayDir);
	gl_FragColor = sdfContext.d<MAX_DIST ? applyShading(rayOrigin, rayDir, sdfContext) : vec4(.0,.0,.0,.0);
}
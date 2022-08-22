precision highp float;
precision highp int;

// --- applyMaterial constants definition
uniform int MAX_STEPS;
uniform float MAX_DIST;
uniform float SURF_DIST;
#define ZERO 0

#include <common>
#include <lightmap_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>



// uniform vec3 u_BoundingBoxMin;
// uniform vec3 u_BoundingBoxMax;


varying vec3 vPw;

#if NUM_SPOT_LIGHTS > 0
	struct SpotLightRayMarching {
		vec3 worldPos;
	};
	uniform SpotLightRayMarching spotLightsRayMarching[ NUM_SPOT_LIGHTS ];
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLightRayMarching {
		vec3 direction;
	};
	uniform DirectionalLightRayMarching directionalLightsRayMarching[ NUM_DIR_LIGHTS ];
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

	// start GetDist builder body code
	

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
	#if NUM_SPOT_LIGHTS > 0 || NUM_DIR_LIGHTS > 0
		vec3 dif = vec3(0.,0.,0.);
		vec3 lightPos,lightCol,lightDir, l;
		float lighDif;
		SDFContext sdfContext;
		#if NUM_SPOT_LIGHTS > 0
			SpotLightRayMarching spotLightRayMarching;
			SpotLight spotLight;
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
		#endif
		#if NUM_DIR_LIGHTS > 0
			DirectionalLightRayMarching directionalLightRayMarching;
			DirectionalLight directionalLight;
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
				directionalLightRayMarching = directionalLightsRayMarching[ i ];
				directionalLight = directionalLights[ i ];
				lightDir = directionalLightRayMarching.direction;
				lightCol = directionalLight.color;
				l = lightDir;
				lighDif = clamp(dot(n, l), 0., 1.);
				sdfContext = RayMarch(p+n*SURF_DIST*2., l);
				if(sdfContext.d<length(lightDir)) lighDif *= .1;

				dif += lightCol * lighDif;
			}
			#pragma unroll_loop_end
		#endif
		return dif;
	#else
		return vec3(1.0, 1.0, 1.0);
	#endif
}

// https://iquilezles.org/articles/rmshadows
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

// --- applyMaterial function definition

vec4 applyShading(vec3 rayOrigin, vec3 rayDir, SDFContext sdfContext){
	vec3 p = rayOrigin + rayDir * sdfContext.d;
	vec3 n = GetNormal(p);
	vec3 diffuse = GetLight(p, n);

	vec3 col = applyMaterial(p, n, rayDir, diffuse, sdfContext.matId);
		
	// gamma
	col = pow( col, vec3(0.4545) ); 
	return vec4(col, 1.);
}

void main()	{

	vec3 rayDir = normalize(vPw - cameraPosition);
	vec3 rayOrigin = cameraPosition;

	SDFContext sdfContext = RayMarch(rayOrigin, rayDir);

	gl_FragColor = sdfContext.d<MAX_DIST ? applyShading(rayOrigin, rayDir, sdfContext) : vec4(.0,.0,.0,.0);

}
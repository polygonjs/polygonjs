precision highp float;
precision highp int;

#include <common>
#include <lightmap_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>

#define DIR_LIGHTS_COUNT 1
#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .01
#define ZERO 0

uniform vec3 u_BoundingBoxMin;
uniform vec3 u_BoundingBoxMax;


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



// const int MAT_FLOOR=1;
// const int MAT_BALL1=2;
// const int MAT_BALL2=3;


// vec2 sphere1(vec3 p){
// 	vec4 s1 = vec4(0, 0.4, 0, 0.2);
// 	float sphereDist1 = length(p-s1.xyz)-s1.w;
// 	return vec2(sphereDist1, MAT_BALL1);
// }
// vec2 sphere2(vec3 p){
// 	vec4 s2 = vec4(0.55, 0.35, 0, 0.2);
// 	float sphereDist2 = length(p-s2.xyz)-s2.w;
// 	return vec2(sphereDist2, MAT_BALL1);
// }
// vec2 sphere3(vec3 p){
// 	vec4 s3 = vec4(0.45, 0.65, .50, 0.15);
// 	float sphereDist3 = length(p-s3.xyz)-s3.w;
// 	return vec2(sphereDist3, MAT_BALL2);
// }
// vec2 groundPlane(vec3 p){
// 	float planeDist = p.y;
// 	return vec2(planeDist, MAT_FLOOR);
// }

SDFContext GetDist(vec3 p) {
	SDFContext sdfContext = SDFContext(0.0, 0);

	// start builder body code
	

	// int mat = 1;
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

vec3 GetLight(vec3 p) {
	#if NUM_SPOT_LIGHTS > 0
		vec3 dif = vec3(0.,0.,0.);
		SpotLightRayMarching spotLightRayMarching;
		SpotLight spotLight;
		vec3 lightPos,lightCol, l, n;
		float lighDif;
		SDFContext sdfContext;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
			spotLightRayMarching = spotLightsRayMarching[ i ];
			spotLight = spotLights[ i ];
			lightPos = spotLightRayMarching.worldPos;
			lightCol = spotLight.color;
			l = normalize(lightPos-p);
			n = GetNormal(p);

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

vec3 applyMat(vec3 p, vec3 col, int mat){
	// vec3 lig = normalize( -u_DirectionalLightDirection );
	col *= vec3(1.0,1.0,1.0);

	if(mat == _RAYMARCHED_MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1){
		col *= applySDFMaterial_962();
	}
	// if(mat==MAT_FLOOR) {
	// 	col *= vec3(1.0,.2,.4);
	// 	// col *= calcSoftshadow( p, lig, 0.02, 2.5, 0.1 );
	// } else if(mat==MAT_BALL1) {
	// 	col *= vec3(0,.8,.8);
	// 	// col *= calcSoftshadow( p, lig, 0.02, 2.5, 0.1 );
	// } else if(mat==MAT_BALL2) {
	// 	col *= vec3(0,.0,.8);
	// 	// col *= calcSoftshadow( p, lig, 0.02, 2.5, 0.1 );
	// }
	return col;
}

vec4 applyShading(vec3 rayOrigin, vec3 rayDir, SDFContext sdfContext){
	vec3 p = rayOrigin + rayDir * sdfContext.d;
	// https://www.shadertoy.com/view/Xds3zN (sdf prims and materials)
	// https://www.shadertoy.com/view/sdsXWr (newton craddle)
	// https://www.shadertoy.com/view/ltjGDd (sphere lights, accumulated shader properties)
	// https://www.shadertoy.com/view/4ddcRn (stochastic path tracer)
	// https://www.shadertoy.com/view/sllGDN (refraction, cube map look up)
	
	vec3 diffuse = GetLight(p);

	vec3 col = applyMat(p, diffuse, sdfContext.matId);
		
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
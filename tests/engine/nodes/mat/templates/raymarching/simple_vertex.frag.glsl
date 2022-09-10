precision highp float;
precision highp int;
uniform int MAX_STEPS;
uniform float MAX_DIST;
uniform float SURF_DIST;
uniform float NORMALS_BIAS;
uniform vec3 CENTER;
#define ZERO 0
#include <common>
float dot2( in vec2 v ) { return dot(v,v); }
float dot2( in vec3 v ) { return dot(v,v); }
float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }
float sdSphere( vec3 p, float s )
{
	return length(p)-s;
}
float sdBox( vec3 p, vec3 b )
{
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float sdRoundBox( vec3 p, vec3 b, float r )
{
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}
float sdBoxFrame( vec3 p, vec3 b, float e )
{
		p = abs(p  )-b;
	vec3 q = abs(p+e)-e;
	return min(min(
		length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
		length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
		length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}
float sdCapsule( vec3 p, vec3 a, vec3 b, float r )
{
	vec3 pa = p - a, ba = b - a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h ) - r;
}
float sdVerticalCapsule( vec3 p, float h, float r )
{
	p.y -= clamp( p.y, 0.0, h );
	return length( p ) - r;
}
float sdCone( in vec3 p, in vec2 c, float h )
{
	vec2 q = h*vec2(c.x/c.y,-1.0);
	vec2 w = vec2( length(p.xz), p.y );
	vec2 a = w - q*clamp( dot(w,q)/dot(q,q), 0.0, 1.0 );
	vec2 b = w - q*vec2( clamp( w.x/q.x, 0.0, 1.0 ), 1.0 );
	float k = sign( q.y );
	float d = min(dot( a, a ),dot(b, b));
	float s = max( k*(w.x*q.y-w.y*q.x),k*(w.y-q.y)  );
	return sqrt(d)*sign(s);
}
float sdConeWrapped(vec3 pos, float angle, float height){
	return sdCone(pos, vec2(sin(angle), cos(angle)), height);
}
float sdRoundCone( vec3 p, float r1, float r2, float h )
{
	float b = (r1-r2)/h;
	float a = sqrt(1.0-b*b);
	vec2 q = vec2( length(p.xz), p.y );
	float k = dot(q,vec2(-b,a));
	if( k<0.0 ) return length(q) - r1;
	if( k>a*h ) return length(q-vec2(0.0,h)) - r2;
	return dot(q, vec2(a,b) ) - r1;
}
float sdPlane( vec3 p, vec3 n, float h )
{
	return dot(p,n) + h;
}
float sdTorus( vec3 p, vec2 t )
{
	vec2 q = vec2(length(p.xz)-t.x,p.y);
	return length(q)-t.y;
}
float sdCappedTorus(in vec3 p, in vec2 sc, in float ra, in float rb)
{
	p.x = abs(p.x);
	float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
	return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;
}
float sdLink( vec3 p, float le, float r1, float r2 )
{
  vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );
  return length(vec2(length(q.xy)-r1,q.z)) - r2;
}
float sdSolidAngle(vec3 pos, vec2 c, float radius)
{
	vec2 p = vec2( length(pos.xz), pos.y );
	float l = length(p) - radius;
	float m = length(p - c*clamp(dot(p,c),0.0,radius) );
	return max(l,m*sign(c.y*p.x-c.x*p.y));
}
float sdSolidAngleWrapped(vec3 pos, float angle, float radius){
	return sdSolidAngle(pos, vec2(sin(angle), cos(angle)), radius);
}
float sdOctahedron( vec3 p, float s)
{
  p = abs(p);
  float m = p.x+p.y+p.z-s;
  vec3 q;
       if( 3.0*p.x < m ) q = p.xyz;
  else if( 3.0*p.y < m ) q = p.yzx;
  else if( 3.0*p.z < m ) q = p.zxy;
  else return m*0.57735027;
    
  float k = clamp(0.5*(q.z-q.y+s),0.0,s); 
  return length(vec3(q.x,q.y-s+k,q.z-k)); 
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
vec4 SDFElongateFast( in vec3 p, in vec3 h )
{
	return vec4( p-clamp(p,-h,h), 0.0 );
}
vec4 SDFElongateSlow( in vec3 p, in vec3 h )
{
	vec3 q = abs(p)-h;
	return vec4( max(q,0.0), min(max(q.x,max(q.y,q.z)),0.0) );
}
float SDFOnion( in float sdf, in float thickness )
{
	return abs(sdf)-thickness;
}
const int _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1 = 154;
struct EnvMap {
	vec3 tint;
	float intensity;
	float fresnel;
	float fresnelPower;
};
vec3 envMapSample(vec3 rayDir, sampler2D map){
	vec2 uv = vec2( atan( -rayDir.z, -rayDir.x ) * RECIPROCAL_PI2 + 0.5, rayDir.y * 0.5 + 0.5 );
	vec3 env = texture2D(map, uv).rgb;
	return env;
}
vec3 envMapSampleWithFresnel(vec3 rayDir, sampler2D map, EnvMap envMap, vec3 n, vec3 cameraPosition){
	vec3 env = envMapSample(rayDir, map).rgb;
	float fresnel = pow(1.-dot(normalize(cameraPosition), n), envMap.fresnelPower);
	float fresnelFactor = (1.-envMap.fresnel) + envMap.fresnel*fresnel;
	return env * envMap.tint * envMap.intensity * fresnelFactor;
}
uniform sampler2D v_POLY_texture_envTexture1;
#include <lightmap_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
varying vec3 vPw;
#if NUM_SPOT_LIGHTS > 0
	struct SpotLightRayMarching {
		vec3 worldPos;
		vec3 direction;
	};
	uniform SpotLightRayMarching spotLightsRayMarching[ NUM_SPOT_LIGHTS ];
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLightRayMarching {
		vec3 direction;
	};
	uniform DirectionalLightRayMarching directionalLightsRayMarching[ NUM_DIR_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLightRayMarching {
		vec3 direction;
	};
	uniform HemisphereLightRayMarching hemisphereLightsRayMarching[ NUM_HEMI_LIGHTS ];
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLightRayMarching {
		vec3 worldPos;
	};
	uniform PointLightRayMarching pointLightsRayMarching[ NUM_POINT_LIGHTS ];
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
SDFContext RayMarch(vec3 ro, vec3 rd, float side) {
	SDFContext dO = SDFContext(0.,0);
	#pragma unroll_loop_start
	for(int i=0; i<MAX_STEPS; i++) {
		vec3 p = ro + rd*dO.d;
		SDFContext sdfContext = GetDist(p);
		dO.d += sdfContext.d * side;
		dO.matId = sdfContext.matId;
		if(dO.d>MAX_DIST || abs(sdfContext.d)<SURF_DIST) break;
	}
	#pragma unroll_loop_end
	return dO;
}
vec3 GetNormal(vec3 p) {
	SDFContext sdfContext = GetDist(p);
	vec2 e = vec2(NORMALS_BIAS, 0);
	vec3 n = sdfContext.d - vec3(
		GetDist(p-e.xyy).d,
		GetDist(p-e.yxy).d,
		GetDist(p-e.yyx).d);
	return normalize(n);
}
vec3 GetLight(vec3 p, vec3 n) {
	vec3 dif = vec3(0.,0.,0.);
	#if NUM_SPOT_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_HEMI_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_RECT_AREA_LIGHTS > 0
		GeometricContext geometry;
		geometry.position = p;
		geometry.normal = n;
		IncidentLight directLight;
		ReflectedLight reflectedLight;
		vec3 lightPos,lightCol,lightDir, l;
		vec3 lighDif;
		SDFContext sdfContext;
		#if NUM_SPOT_LIGHTS > 0
			SpotLightRayMarching spotLightRayMarching;
			SpotLight spotLight;
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
				spotLightRayMarching = spotLightsRayMarching[ i ];
				spotLight = spotLights[ i ];
				spotLight.position = spotLightRayMarching.worldPos;
				spotLight.direction = spotLightRayMarching.direction;
				getSpotLightInfo( spotLight, geometry, directLight );
				
				lightPos = spotLightRayMarching.worldPos;
				lightCol = spotLight.color;
				l = normalize(lightPos-p);
				lighDif = directLight.color * clamp(dot(n, l), 0., 1.);
				sdfContext = RayMarch(p+n*SURF_DIST*2., l, 1.);
				if(sdfContext.d<length(lightPos-p)) lighDif *= .0;
				dif += lighDif;
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
				lighDif = lightCol * clamp(dot(n, l), 0., 1.);
				sdfContext = RayMarch(p+n*SURF_DIST*2., l, 1.);
				if(sdfContext.d<length(lightDir)) lighDif *= .0;
				dif += lighDif;
			}
			#pragma unroll_loop_end
		#endif
		
		#if ( NUM_HEMI_LIGHTS > 0 )
			#pragma unroll_loop_start
			HemisphereLight hemiLight;
			for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
				hemiLight.skyColor = hemisphereLights[ i ].skyColor;
				hemiLight.groundColor = hemisphereLights[ i ].groundColor;
				hemiLight.direction = hemisphereLightsRayMarching[ i ].direction;
				dif += getHemisphereLightIrradiance( hemiLight, n );
			}
			#pragma unroll_loop_end
		#endif
		#if NUM_POINT_LIGHTS > 0
			PointLightRayMarching pointLightRayMarching;
			PointLight pointLight;
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
				pointLightRayMarching = pointLightsRayMarching[ i ];
				pointLight = pointLights[ i ];
				pointLight.position = pointLightRayMarching.worldPos;
				getPointLightInfo( pointLight, geometry, directLight );
				
				lightPos = pointLightRayMarching.worldPos;
				lightCol = pointLight.color;
				l = normalize(lightPos-p);
				lighDif = directLight.color * clamp(dot(n, l), 0., 1.);
				sdfContext = RayMarch(p+n*SURF_DIST*2., l, 1.);
				if(sdfContext.d<length(lightPos-p)) lighDif *= .0;
				dif += lighDif;
			}
			#pragma unroll_loop_end
		#endif
				
	#endif
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	dif += irradiance;
	return dif;
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
vec3 applyMaterialWithoutRefraction(vec3 p, vec3 n, vec3 rayDir, int mat){
	vec3 col = vec3(1.);
	vec3 v_POLY_constant1_val = vec3(1.0, 1.0, 1.0);
	
	vec3 v_POLY_globals1_position = p;
	
	float v_POLY_SDFSphere1_float = sdSphere(v_POLY_globals1_position - vec3(0.0, 0.0, 0.0), 1.0);
	
	vec3 v_POLY_multScalar1_val = (v_POLY_SDFSphere1_float*v_POLY_constant1_val);
	
	if(mat == _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1){
		col = v_POLY_multScalar1_val;
		vec3 diffuse = GetLight(p, n);
		col *= diffuse;
		vec3 rayDir = normalize(reflect(rayDir, n));
		EnvMap envMap;
		envMap.tint = vec3(1.0, 1.0, 1.0);
		envMap.intensity = 1.0;
		envMap.fresnel = 0.0;
		envMap.fresnelPower = 5.0;
		col += envMapSampleWithFresnel(rayDir, v_POLY_texture_envTexture1, envMap, n, cameraPosition);
	}
	
	return col;
}
vec3 applyMaterialWithoutReflection(vec3 p, vec3 n, vec3 rayDir, int mat){
	vec3 col = vec3(1.);
	vec3 v_POLY_constant1_val = vec3(1.0, 1.0, 1.0);
	
	vec3 v_POLY_globals1_position = p;
	
	float v_POLY_SDFSphere1_float = sdSphere(v_POLY_globals1_position - vec3(0.0, 0.0, 0.0), 1.0);
	
	vec3 v_POLY_multScalar1_val = (v_POLY_SDFSphere1_float*v_POLY_constant1_val);
	
	if(mat == _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1){
		col = v_POLY_multScalar1_val;
		vec3 diffuse = GetLight(p, n);
		col *= diffuse;
		vec3 rayDir = normalize(reflect(rayDir, n));
		EnvMap envMap;
		envMap.tint = vec3(1.0, 1.0, 1.0);
		envMap.intensity = 1.0;
		envMap.fresnel = 0.0;
		envMap.fresnelPower = 5.0;
		col += envMapSampleWithFresnel(rayDir, v_POLY_texture_envTexture1, envMap, n, cameraPosition);
	}
	
	return col;
}
#ifdef RAYMARCHED_REFLECTIONS
vec3 GetReflection(vec3 p, vec3 n, vec3 rayDir, float biasMult, sampler2D envMap, int reflectionDepth){
	bool hitReflection = true;
	vec3 reflectedColor = vec3(0.);
	#pragma unroll_loop_start
	for(int i=0; i < reflectionDepth; i++) {
		if(hitReflection){
			rayDir = reflect(rayDir, n);
			p += n*SURF_DIST*biasMult;
			SDFContext sdfContext = RayMarch(p, rayDir, 1.);
			if( sdfContext.d >= MAX_DIST){
				hitReflection = false;
				reflectedColor = envMapSample(rayDir, envMap);
			}
			if(hitReflection){
				p += rayDir * sdfContext.d;
				n = GetNormal(p);
				vec3 matCol = applyMaterialWithoutReflection(p, n, rayDir, sdfContext.matId);
				reflectedColor += matCol;
			}
		}
	}
	#pragma unroll_loop_end
	return reflectedColor;
}
#endif
#ifdef RAYMARCHED_REFRACTIONS
vec4 GetRefractedData(vec3 p, vec3 n, vec3 rayDir, float ior, float biasMult, sampler2D envMap, int refractionDepth){
	bool hitRefraction = true;
	bool changeSide = true;
	float side = -1.;
	float iorInverted = 1. / ior;
	vec3 refractedColor = vec3(0.);
	float distanceInsideMedium=0.;
	#pragma unroll_loop_start
	for(int i=0; i < refractionDepth; i++) {
		if(hitRefraction){
			float currentIor = side<0. ? iorInverted : ior;
			vec3 rayDirPreRefract = rayDir;
			rayDir = refract(rayDir, n, currentIor);
			changeSide = dot(rayDir, rayDir)!=0.;
			if(changeSide == true) {
				p -= n*SURF_DIST*(2.+biasMult);
			} else {
				p += n*SURF_DIST*(   biasMult);
				rayDir = reflect(rayDirPreRefract, n);
			}
			SDFContext sdfContext = RayMarch(p, rayDir, side);
			if( abs(sdfContext.d) >= MAX_DIST ){
				hitRefraction = false;
				refractedColor = envMapSample(rayDir, envMap);
			}
			if(hitRefraction){
				p += rayDir * sdfContext.d;
				n = GetNormal(p) * side;
				vec3 matCol = applyMaterialWithoutRefraction(p, n, rayDir, sdfContext.matId);
				refractedColor = matCol;
				distanceInsideMedium += side < 0. ? abs(sdfContext.d) : 0.;
				if( changeSide ){
					side *= -1.;
				}
			}
		}
	}
	#pragma unroll_loop_end
	return vec4(refractedColor, distanceInsideMedium);
}
vec3 applyRefractionAbsorbtion(vec4 refractedData, vec3 tint, float absorbtion){
	vec3 refractedColor = refractedData.rgb;
	float distanceInsideMedium = refractedData.w;
	float tintFactor = 1.+(distanceInsideMedium * absorbtion);
	tint.r = pow(tint.r, tintFactor);
	tint.g = pow(tint.g, tintFactor);
	tint.b = pow(tint.b, tintFactor);
	refractedColor = refractedColor * tint;
	return refractedColor;
}
#endif
vec3 applyMaterial(vec3 p, vec3 n, vec3 rayDir, int mat){
	vec3 col = vec3(0.);
	vec3 v_POLY_constant1_val = vec3(1.0, 1.0, 1.0);
	
	vec3 v_POLY_globals1_position = p;
	
	float v_POLY_SDFSphere1_float = sdSphere(v_POLY_globals1_position - vec3(0.0, 0.0, 0.0), 1.0);
	
	vec3 v_POLY_multScalar1_val = (v_POLY_SDFSphere1_float*v_POLY_constant1_val);
	
	if(mat == _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1){
		col = v_POLY_multScalar1_val;
		vec3 diffuse = GetLight(p, n);
		col *= diffuse;
		vec3 rayDir = normalize(reflect(rayDir, n));
		EnvMap envMap;
		envMap.tint = vec3(1.0, 1.0, 1.0);
		envMap.intensity = 1.0;
		envMap.fresnel = 0.0;
		envMap.fresnelPower = 5.0;
		col += envMapSampleWithFresnel(rayDir, v_POLY_texture_envTexture1, envMap, n, cameraPosition);
	}
	
	return col;
}
vec4 applyShading(vec3 rayOrigin, vec3 rayDir, SDFContext sdfContext){
	vec3 p = rayOrigin + rayDir * sdfContext.d;
	vec3 n = GetNormal(p);
	
	vec3 col = applyMaterial(p, n, rayDir, sdfContext.matId);
		
	col = pow( col, vec3(0.4545) ); 
	return vec4(col, 1.);
}
void main()	{
	vec3 rayDir = normalize(vPw - cameraPosition);
	vec3 rayOrigin = cameraPosition - CENTER;
	SDFContext sdfContext = RayMarch(rayOrigin, rayDir, 1.);
	gl_FragColor = vec4(0.);
	if( sdfContext.d >= MAX_DIST ){ discard; }
	gl_FragColor = applyShading(rayOrigin, rayDir, sdfContext);
}
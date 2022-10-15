precision highp float;
precision highp int;

// --- applyMaterial constants definition
uniform int MAX_STEPS;
uniform float MAX_DIST;
uniform float SURF_DIST;
uniform float NORMALS_BIAS;
uniform vec3 CENTER;
#define ZERO 0
uniform float debugMinSteps;
uniform float debugMaxSteps;
uniform float debugMinDepth;
uniform float debugMaxDepth;

#include <common>
#include <packing>
#include <lightmap_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>

#if defined( SHADOW_DISTANCE )
	uniform float shadowDistanceMin;
	uniform float shadowDistanceMax;
#endif 
#if defined( SHADOW_DEPTH )
	uniform float shadowDepthMin;
	uniform float shadowDepthMax;
#endif 

// uniform vec3 u_BoundingBoxMin;
// uniform vec3 u_BoundingBoxMax;


varying vec3 vPw;

#if NUM_SPOT_LIGHTS > 0
	struct SpotLightRayMarching {
		vec3 worldPos;
		vec3 direction;
		float penumbra;
	};
	uniform SpotLightRayMarching spotLightsRayMarching[ NUM_SPOT_LIGHTS ];
	#if NUM_SPOT_LIGHT_COORDS > 0

		uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];

	#endif
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLightRayMarching {
		vec3 direction;
		float penumbra;
	};
	uniform DirectionalLightRayMarching directionalLightsRayMarching[ NUM_DIR_LIGHTS ];
	#if NUM_DIR_LIGHT_SHADOWS > 0

		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];

	#endif
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
		float penumbra;
	};
	uniform PointLightRayMarching pointLightsRayMarching[ NUM_POINT_LIGHTS ];
	#if NUM_POINT_LIGHT_SHADOWS > 0

		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];

	#endif
#endif


struct SDFContext {
	float d;
	int stepsCount;
	int matId;
	int matId2;
	float matBlend;
};

SDFContext DefaultSDFContext(){
	return SDFContext( 0., 0, 0, 0, 0. );
}
int DefaultSDFMaterial(){
	return 0;
}



SDFContext GetDist(vec3 p) {
	SDFContext sdfContext = SDFContext(0., 0, 0, 0, 0.);

	// start GetDist builder body code
	

	return sdfContext;
}

SDFContext RayMarch(vec3 ro, vec3 rd, float side) {
	SDFContext dO = SDFContext(0.,0,0,0,0.);

	#pragma unroll_loop_start
	for(int i=0; i<MAX_STEPS; i++) {
		vec3 p = ro + rd*dO.d;
		SDFContext sdfContext = GetDist(p);
		dO.d += sdfContext.d * side;
		#if defined( DEBUG_STEPS_COUNT )
			dO.stepsCount += 1;
		#endif
		dO.matId = sdfContext.matId;
		dO.matId2 = sdfContext.matId2;
		dO.matBlend = sdfContext.matBlend;
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
// https://iquilezles.org/articles/rmshadows
float calcSoftshadow( in vec3 ro, in vec3 rd, float mint, float maxt, float k, inout SDFContext sdfContext )
{
	float res = 1.0;
	float ph = 1e20;
	for( float t=mint; t<maxt; )
	{
		float h = GetDist(ro + rd*t).d;
		#if defined( DEBUG_STEPS_COUNT )
			sdfContext.stepsCount += 1;
		#endif
		if( h<SURF_DIST )
			return 0.0;
		float y = h*h/(2.0*ph);
		float d = sqrt(h*h-y*y);
		res = min( res, k*d/max(0.0,t-y) );
		ph = h;
		t += h;
	}
	return res;
}

vec3 GetLight(vec3 p, vec3 n, inout SDFContext sdfContext) {
	vec3 dif = vec3(0.,0.,0.);
	#if NUM_SPOT_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_HEMI_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_RECT_AREA_LIGHTS > 0
		GeometricContext geometry;
		geometry.position = p;
		geometry.normal = n;
		// geometry.viewDir = rayDir;

		// vec4 mvPosition = vec4( p, 1.0 );
		// mvPosition = modelViewMatrix * mvPosition;
		// vec3 vViewPosition = - mvPosition.xyz;
		// geometry.position = p;
		// geometry.normal = n;
		// geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( cameraPosition - p );

		IncidentLight directLight;
		ReflectedLight reflectedLight;
		vec3 lightPos, lightDir, l;
		vec3 lighDif;
		#if NUM_SPOT_LIGHTS > 0
			SpotLightRayMarching spotLightRayMarching;
			SpotLight spotLight;
			#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
				SpotLightShadow spotLightShadow;
			#endif
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
				spotLightRayMarching = spotLightsRayMarching[ i ];
				spotLight = spotLights[ i ];
				spotLight.position = spotLightRayMarching.worldPos;
				spotLight.direction = spotLightRayMarching.direction;
				getSpotLightInfo( spotLight, geometry, directLight );
				
				lightPos = spotLightRayMarching.worldPos;
				
				#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
					spotLightShadow = spotLightShadows[ i ];
					vec4 spotLightShadowCoord = spotLightMatrix[ i ] * vec4(p, 1.0);
					directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, spotLightShadowCoord ) : 1.0;
				#endif

				l = normalize(lightPos-p);
				float spotLightSdfShadow = calcSoftshadow(p, l, 10.*SURF_DIST, distance(p,lightPos), 1./max(spotLightRayMarching.penumbra*0.2,0.001), sdfContext);
				lighDif = directLight.color * clamp(dot(n, l), 0., 1.) * spotLightSdfShadow;
				
				dif += lighDif;
			}
			#pragma unroll_loop_end
		#endif
		#if NUM_DIR_LIGHTS > 0
			DirectionalLightRayMarching directionalLightRayMarching;
			DirectionalLight directionalLight;
			#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
				DirectionalLightShadow directionalLightShadow;
			#endif
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
				directionalLightRayMarching = directionalLightsRayMarching[ i ];
				directionalLight = directionalLights[ i ];
				lightDir = directionalLightRayMarching.direction;
				getDirectionalLightInfo( directionalLight, geometry, directLight );

				#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
					directionalLightShadow = directionalLightShadows[ i ];
					vec4 dirLightShadowCoord = directionalShadowMatrix[ i ] * vec4(p, 1.0);
					directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, dirLightShadowCoord ) : 1.0;
				#endif

				l = lightDir;
				float dirLightSdfShadow = calcSoftshadow(p, l, 10.*SURF_DIST, distance(p,lightPos), 1./max(directionalLightRayMarching.penumbra*0.2,0.001), sdfContext);
				lighDif = directLight.color * clamp(dot(n, l), 0., 1.) * dirLightSdfShadow;

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
			#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
				PointLightShadow pointLightShadow;
			#endif
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
				pointLightRayMarching = pointLightsRayMarching[ i ];
				pointLight = pointLights[ i ];
				pointLight.position = pointLightRayMarching.worldPos;
				getPointLightInfo( pointLight, geometry, directLight );

				#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
					pointLightShadow = pointLightShadows[ i ];
					vec4 pointLightShadowCoord = pointShadowMatrix[ i ] * vec4(p, 1.0);
					directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, pointLightShadowCoord, pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
				#endif
				
				lightPos = pointLightRayMarching.worldPos;
				l = normalize(lightPos-p);
				float pointLightSdfShadow = calcSoftshadow(p, l, 10.*SURF_DIST, distance(p,lightPos), 1./max(pointLightRayMarching.penumbra*0.2,0.001), sdfContext);
				lighDif = directLight.color * clamp(dot(n, l), 0., 1.) * pointLightSdfShadow;

				dif += lighDif;
			}
			#pragma unroll_loop_end
		#endif

		// #if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

		// 	RectAreaLight rectAreaLight;
		// 	AreaLightRayMarching areaLightRayMarching;
		// 	PhysicalMaterial material;
		// 	material.roughness = 1.;
		// 	material.specularColor = vec3(1.);
		// 	material.diffuseColor = vec3(1.);

		// 	#pragma unroll_loop_start
		// 	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		// 		areaLightRayMarching = areaLightsRayMarching[ i ];
		// 		rectAreaLight = rectAreaLights[ i ];
		// 		rectAreaLight.position = areaLightRayMarching.worldPos;

				
		// 		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
		// 	}
		// 	#pragma unroll_loop_end
		// 	dif += reflectedLight.directDiffuse;

		// #endif
	#endif

	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

	// irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
	dif += irradiance;
	return dif;
}



// --- applyMaterial function definition



vec4 applyShading(vec3 rayOrigin, vec3 rayDir, inout SDFContext sdfContext){
	vec3 p = rayOrigin + rayDir * sdfContext.d;
	vec3 n = GetNormal(p);
	
	vec3 col = applyMaterial(p, n, rayDir, sdfContext.matId, sdfContext);
	if(sdfContext.matBlend > 0.) {
		// blend material colors if needed
		vec3 col2 = applyMaterial(p, n, rayDir, sdfContext.matId2, sdfContext);
		col = (1. - sdfContext.matBlend)*col + sdfContext.matBlend*col2;
	}
		
	// gamma
	col = pow( col, vec3(0.4545) ); 
	return vec4(col, 1.);
}

void main()	{

	vec3 rayDir = normalize(vPw - cameraPosition);
	vec3 rayOrigin = cameraPosition - CENTER;

	SDFContext sdfContext = RayMarch(rayOrigin, rayDir, 1.);

	#if defined( DEBUG_DEPTH )
		float normalizedDepth = 1.-(sdfContext.d - debugMinDepth ) / ( debugMaxDepth - debugMinDepth );
		normalizedDepth = saturate(normalizedDepth); // clamp to [0,1]
		gl_FragColor = vec4(normalizedDepth);
		return;
	#endif
	#if defined( SHADOW_DEPTH )
		float normalizedDepth = 1.-(sdfContext.d - shadowDepthMin ) / ( shadowDepthMax - shadowDepthMin );
		normalizedDepth = saturate(normalizedDepth); // clamp to [0,1]
		gl_FragColor = packDepthToRGBA( normalizedDepth );
		return;
	#endif
	#if defined( SHADOW_DISTANCE )
		float normalizedDepth = (sdfContext.d - shadowDistanceMin ) / ( shadowDistanceMax - shadowDistanceMin );
		normalizedDepth = saturate(normalizedDepth); // clamp to [0,1]
		gl_FragColor = packDepthToRGBA( normalizedDepth );
		return;
	#endif

	if( sdfContext.d < MAX_DIST ){
		gl_FragColor = applyShading(rayOrigin, rayDir, sdfContext);
	} else {
		gl_FragColor = vec4(0.);
	}

	#if defined( DEBUG_STEPS_COUNT )
		float normalizedStepsCount = (float(sdfContext.stepsCount) - debugMinSteps ) / ( debugMaxSteps - debugMinSteps );
		gl_FragColor = vec4(normalizedStepsCount, 1.-normalizedStepsCount, 0., 1.);
		return;
	#endif
	
}
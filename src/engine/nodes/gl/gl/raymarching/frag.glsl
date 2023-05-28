precision highp float;
precision highp int;

// --- applyMaterial constants definition
uniform int MAX_STEPS;
uniform float MAX_DIST;
uniform float SURF_DIST;
uniform float NORMALS_BIAS;
uniform float SHADOW_BIAS;
#define ZERO 0
uniform float debugMinSteps;
uniform float debugMaxSteps;
uniform float debugMinDepth;
uniform float debugMaxDepth;

#include <common>
#include <packing>
#include <lightmap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>
#include <fog_pars_fragment>

#if defined( SHADOW_DISTANCE )
	uniform float shadowDistanceMin;
	uniform float shadowDistanceMax;
#endif 
#if defined( SHADOW_DEPTH )
	uniform float shadowDepthMin;
	uniform float shadowDepthMax;
#endif

// varying vec2 vHighPrecisionZW;

varying vec3 vPw;
varying mat4 vModelMatrix;
varying mat4 vInverseModelMatrix;
varying mat4 VViewMatrix;

#if NUM_SPOT_LIGHTS > 0
	struct SpotLightRayMarching {
		float penumbra;
		float shadowBiasAngle;
		float shadowBiasDistance;
	};
	uniform SpotLightRayMarching spotLightsRayMarching[ NUM_SPOT_LIGHTS ];
	#if NUM_SPOT_LIGHT_COORDS > 0

		uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];

	#endif
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLightRayMarching {
		float penumbra;
		float shadowBiasAngle;
		float shadowBiasDistance;
	};
	uniform DirectionalLightRayMarching directionalLightsRayMarching[ NUM_DIR_LIGHTS ];
	#if NUM_DIR_LIGHT_SHADOWS > 0

		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];

	#endif
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLightRayMarching {
		float penumbra;
		float shadowBiasAngle;
		float shadowBiasDistance;
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

// start raymarching builder define code


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

vec3 GetLight(vec3 _p, vec3 _n, inout SDFContext sdfContext) {
	vec3 dif = vec3(0.,0.,0.);
	GeometricContext geometry;
	// geometry.position = _p;
	// geometry.normal = _n;
	// geometry.viewDir = rayDir;

	// vec4 mvPosition = vec4( p, 1.0 );
	// mvPosition = modelViewMatrix * mvPosition;
	// vec3 vViewPosition = - mvPosition.xyz;
	vec3 pWorld = ( vModelMatrix * vec4( _p, 1.0 )).xyz;
	vec3 nWorld = transformDirection(_n, vModelMatrix);
	// geometry.position = (VViewMatrix * vec4( _p, 1.0 )).xyz;
	geometry.position = (VViewMatrix * vec4(pWorld, 1.0 )).xyz;
	// geometry.normal = transformDirection(_n, VViewMatrix);
	// geometry.normal = inverseTransformDirection(transformDirection(_n, VViewMatrix), vInverseModelMatrix);
	geometry.normal = transformDirection(nWorld, VViewMatrix);
	geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( cameraPosition - geometry.position );

	#if NUM_SPOT_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_HEMI_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_RECT_AREA_LIGHTS > 0

		IncidentLight directLight;
		ReflectedLight reflectedLight;
		vec3 lightPos, lightDir, worldLightDir, objectSpaceLightDir, lighDif, directDiffuse;
		float dotNL, lightDistance;
		#if NUM_SPOT_LIGHTS > 0
			SpotLightRayMarching spotLightRayMarching;
			SpotLight spotLight;
			float spotLightSdfShadow;
			#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
				SpotLightShadow spotLightShadow;
			#endif
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
				spotLightRayMarching = spotLightsRayMarching[ i ];
				spotLight = spotLights[ i ];
				getSpotLightInfo( spotLight, geometry, directLight );

				// #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
				// 	spotLightShadow = spotLightShadows[ i ];
				// 	vec4 spotLightShadowCoord = spotLightMatrix[ i ] * vec4(pWorld+SHADOW_BIAS*nWorld, 1.0);
				// 	directLight.color *= (directLight.visible && receiveShadow) ? getShadow(
				// 		spotShadowMap[ i ],
				// 		spotLightShadow.shadowMapSize,
				// 		spotLightShadow.shadowBias,
				// 		spotLightShadow.shadowRadius,
				// 		spotLightShadowCoord
				// 	) : 1.0;
				// #endif

				lightPos = spotLight.position;
				lightDir = normalize(lightPos-geometry.position);
				worldLightDir = inverseTransformDirection(lightDir, VViewMatrix);
				objectSpaceLightDir = inverseTransformDirection(worldLightDir, vModelMatrix);
				lightDistance = distance(geometry.position,lightPos);
				spotLightSdfShadow =
					dot( _n, objectSpaceLightDir ) < spotLightRayMarching.shadowBiasAngle
					? 1.
					: calcSoftshadow(
						_p,
						objectSpaceLightDir,
						spotLightRayMarching.shadowBiasDistance,
						distance(geometry.position,lightPos),
						1./max(spotLightRayMarching.penumbra*0.2,0.001),
						sdfContext
					);
				dotNL = saturate( dot( geometry.normal, directLight.direction ) );
				directDiffuse = dotNL * directLight.color * BRDF_Lambert( vec3(1.) );
				dif += directDiffuse * spotLightSdfShadow;
			}
			#pragma unroll_loop_end
		#endif
		#if NUM_DIR_LIGHTS > 0
			DirectionalLightRayMarching directionalLightRayMarching;
			DirectionalLight directionalLight;
			float dirLightSdfShadow;
			#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
				DirectionalLightShadow directionalLightShadow;
			#endif
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
				directionalLightRayMarching = directionalLightsRayMarching[ i ];
				directionalLight = directionalLights[ i ];
				
				getDirectionalLightInfo( directionalLight, geometry, directLight );

				// #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
				// 	directionalLightShadow = directionalLightShadows[ i ];
				// 	vec4 dirLightShadowCoord = directionalShadowMatrix[ i ] * vec4(pWorld+SHADOW_BIAS*nWorld, 1.0);
				// 	directLight.color *= (directLight.visible && receiveShadow) ? getShadow(
				// 		directionalShadowMap[ i ],
				// 		directionalLightShadow.shadowMapSize,
				// 		directionalLightShadow.shadowBias,
				// 		directionalLightShadow.shadowRadius,
				// 		dirLightShadowCoord
				// 	) : 1.0;
				// #endif

				lightDir = directionalLight.direction;
				worldLightDir = inverseTransformDirection(lightDir, VViewMatrix);
				objectSpaceLightDir = inverseTransformDirection(worldLightDir, vModelMatrix);
				dirLightSdfShadow =
					dot( _n, objectSpaceLightDir ) < directionalLightRayMarching.shadowBiasAngle
					? 1.
					:
					calcSoftshadow(
						_p,
						objectSpaceLightDir,
						directionalLightRayMarching.shadowBiasDistance,
						MAX_DIST,//distance(geometry.position,lightPos),
						1./max(directionalLightRayMarching.penumbra*0.2,0.001),
						sdfContext
					);
				dotNL = saturate( dot( geometry.normal, directLight.direction ) );
				// lighDif = directLight.color * dotNL * dirLightSdfShadow;
				directDiffuse = dotNL * directLight.color * BRDF_Lambert( vec3(1.) );
				dif += directDiffuse * dirLightSdfShadow;
			}
			#pragma unroll_loop_end
		#endif

		#if ( NUM_HEMI_LIGHTS > 0 )

			#pragma unroll_loop_start
			HemisphereLight hemiLight;
			for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
				hemiLight = hemisphereLights[ i ];
				dif += getHemisphereLightIrradiance( hemiLight, geometry.normal ) * BRDF_Lambert( vec3(1.) );

			}
			#pragma unroll_loop_end

		#endif

		#if NUM_POINT_LIGHTS > 0
			PointLightRayMarching pointLightRayMarching;
			PointLight pointLight;
			float pointLightSdfShadow;
			#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
				PointLightShadow pointLightShadow;
			#endif
			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
				pointLightRayMarching = pointLightsRayMarching[ i ];
				pointLight = pointLights[ i ];
				getPointLightInfo( pointLight, geometry, directLight );


				#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
					pointLightShadow = pointLightShadows[ i ];
					vec4 pointLightShadowCoord = pointShadowMatrix[ i ] * vec4(pWorld+SHADOW_BIAS*nWorld, 1.0);
					directLight.color *= (directLight.visible && receiveShadow) ? getPointShadow(
						pointShadowMap[ i ],
						pointLightShadow.shadowMapSize,
						pointLightShadow.shadowBias,
						pointLightShadow.shadowRadius,
						pointLightShadowCoord,
						pointLightShadow.shadowCameraNear,
						pointLightShadow.shadowCameraFar
					) : 1.0;
				#endif

				lightPos = pointLight.position;
				lightDir = normalize(lightPos-geometry.position);
				worldLightDir = inverseTransformDirection(lightDir, VViewMatrix);
				objectSpaceLightDir = inverseTransformDirection(worldLightDir, vModelMatrix);
				pointLightSdfShadow =
					dot( _n, objectSpaceLightDir ) < pointLightRayMarching.shadowBiasAngle
					? 1.
					:
					calcSoftshadow(
					_p,
					objectSpaceLightDir,
					pointLightRayMarching.shadowBiasDistance,
					distance(geometry.position,lightPos),
					1./max(pointLightRayMarching.penumbra*0.2,0.001),
					sdfContext
				);
				dotNL = saturate( dot( geometry.normal, directLight.direction ) );
				directDiffuse = dotNL * directLight.color * BRDF_Lambert( vec3(1.) );
				dif += directDiffuse * pointLightSdfShadow;
			}
			#pragma unroll_loop_end
		#endif

		#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

			RectAreaLight rectAreaLight;
			// AreaLightRayMarching areaLightRayMarching;
			PhysicalMaterial material;
			material.roughness = 1.;
			material.specularColor = vec3(1.);
			material.diffuseColor = vec3(1.);

			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
				// areaLightRayMarching = areaLightsRayMarching[ i ];
				rectAreaLight = rectAreaLights[ i ];
				// rectAreaLight.position = areaLightRayMarching.worldPos;

				RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
			}
			#pragma unroll_loop_end
			dif += reflectedLight.directDiffuse;

		#endif
	#endif

	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
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
	//col = pow( col, vec3(0.4545) ); // this gamma leads to a different look than standard materials
	return vec4(col, 1.);
}

void main()	{

	vec3 rayDir = normalize(vPw - cameraPosition);
	rayDir = transformDirection(rayDir, vInverseModelMatrix);
	vec3 rayOrigin = (vInverseModelMatrix * vec4( cameraPosition, 1.0 )).xyz;

	SDFContext sdfContext = RayMarch(rayOrigin, rayDir, 1.);

	#if defined( DEBUG_DEPTH )
		float normalizedDepth = 1.-(sdfContext.d - debugMinDepth ) / ( debugMaxDepth - debugMinDepth );
		normalizedDepth = saturate(normalizedDepth); // clamp to [0,1]
		gl_FragColor = vec4(normalizedDepth);
		return;
	#endif
	#if defined( SHADOW_DEPTH )
		float normalizedDepth = 1.-(sdfContext.d - debugMinDepth ) / ( debugMaxDepth - debugMinDepth );
		// float fragCoordZ = sdfContext.d / vHighPrecisionZW[1];
		float compoundedDepth = 0.5 * (normalizedDepth) + 0.5;
		float alpha = sdfContext.d < MAX_DIST ? 0.:1.;
		gl_FragColor = vec4( vec3(compoundedDepth), alpha );
		// normalizedDepth = 0.5*normalizedDepth+0.5;
		// gl_FragColor = packDepthToRGBA( normalizedDepth );
		// gl_FragColor = vec4(0.);
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
		#if defined( TONE_MAPPING )
			gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
		#endif
		gl_FragColor = linearToOutputTexel( gl_FragColor );

		#ifdef USE_FOG
			float vFogDepth = sdfContext.d;
			#ifdef FOG_EXP2
				float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
			#else
				float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
			#endif
			gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
		#endif
		#include <premultiplied_alpha_fragment>
		#include <dithering_fragment>
	} else {
		gl_FragColor = vec4(0.);
	}

	#if defined( DEBUG_STEPS_COUNT )
		float normalizedStepsCount = (float(sdfContext.stepsCount) - debugMinSteps ) / ( debugMaxSteps - debugMinSteps );
		gl_FragColor = vec4(normalizedStepsCount, 1.-normalizedStepsCount, 0., 1.);
		return;
	#endif
	
}
import {AssemblerName, ControllerAssemblerPair} from './_BaseRegister';
import {GlAssemblerController} from '../../../nodes/gl/code/Controller';
import {ShaderAssemblerBasic} from '../../../nodes/gl/code/assemblers/materials/Basic';
import {ShaderAssemblerLambert} from '../../../nodes/gl/code/assemblers/materials/Lambert';
import {ShaderAssemblerPhong} from '../../../nodes/gl/code/assemblers/materials/Phong';
import {ShaderAssemblerStandard} from '../../../nodes/gl/code/assemblers/materials/Standard';
import {ShaderAssemblerPhysical} from '../../../nodes/gl/code/assemblers/materials/Physical';
import {ShaderAssemblerPoints} from '../../../nodes/gl/code/assemblers/materials/Points';
import {ShaderAssemblerLine} from '../../../nodes/gl/code/assemblers/materials/Line';
import {ShaderAssemblerParticles} from '../../../nodes/gl/code/assemblers/particles/Particles';
import {ShaderAssemblerTexture} from '../../../nodes/gl/code/assemblers/textures/Texture';
import {ShaderAssemblerVolume} from '../../../nodes/gl/code/assemblers/materials/Volume';

export interface AssemblersMap extends PolyDictionary<ControllerAssemblerPair> {
	[AssemblerName.GL_MESH_BASIC]: {
		controller: GlAssemblerController<ShaderAssemblerBasic>;
		assembler: typeof ShaderAssemblerBasic;
	};
	[AssemblerName.GL_MESH_LAMBERT]: {
		controller: GlAssemblerController<ShaderAssemblerLambert>;
		assembler: typeof ShaderAssemblerLambert;
	};
	[AssemblerName.GL_MESH_PHONG]: {
		controller: GlAssemblerController<ShaderAssemblerPhong>;
		assembler: typeof ShaderAssemblerPhong;
	};
	[AssemblerName.GL_MESH_STANDARD]: {
		controller: GlAssemblerController<ShaderAssemblerStandard>;
		assembler: typeof ShaderAssemblerStandard;
	};
	[AssemblerName.GL_MESH_PHYSICAL]: {
		controller: GlAssemblerController<ShaderAssemblerPhysical>;
		assembler: typeof ShaderAssemblerPhysical;
	};
	[AssemblerName.GL_PARTICLES]: {
		controller: GlAssemblerController<ShaderAssemblerParticles>;
		assembler: typeof ShaderAssemblerParticles;
	};
	[AssemblerName.GL_POINTS]: {
		controller: GlAssemblerController<ShaderAssemblerPoints>;
		assembler: typeof ShaderAssemblerPoints;
	};
	[AssemblerName.GL_LINE]: {
		controller: GlAssemblerController<ShaderAssemblerLine>;
		assembler: typeof ShaderAssemblerLine;
	};
	[AssemblerName.GL_TEXTURE]: {
		controller: GlAssemblerController<ShaderAssemblerTexture>;
		assembler: typeof ShaderAssemblerTexture;
	};
	[AssemblerName.GL_VOLUME]: {
		controller: GlAssemblerController<ShaderAssemblerVolume>;
		assembler: typeof ShaderAssemblerVolume;
	};
}

import {PolyEngine} from '../../../Poly';
import {PolyDictionary} from '../../../../types/GlobalTypes';
export class AllAssemblersRegister {
	static run(poly: PolyEngine) {
		poly.assemblersRegister.register(AssemblerName.GL_MESH_BASIC, GlAssemblerController, ShaderAssemblerBasic);
		poly.assemblersRegister.register(AssemblerName.GL_MESH_LAMBERT, GlAssemblerController, ShaderAssemblerLambert);
		poly.assemblersRegister.register(AssemblerName.GL_MESH_PHONG, GlAssemblerController, ShaderAssemblerPhong);
		poly.assemblersRegister.register(
			AssemblerName.GL_MESH_STANDARD,
			GlAssemblerController,
			ShaderAssemblerStandard
		);
		poly.assemblersRegister.register(
			AssemblerName.GL_MESH_PHYSICAL,
			GlAssemblerController,
			ShaderAssemblerPhysical
		);
		poly.assemblersRegister.register(AssemblerName.GL_PARTICLES, GlAssemblerController, ShaderAssemblerParticles);
		poly.assemblersRegister.register(AssemblerName.GL_POINTS, GlAssemblerController, ShaderAssemblerPoints);
		poly.assemblersRegister.register(AssemblerName.GL_LINE, GlAssemblerController, ShaderAssemblerLine);
		poly.assemblersRegister.register(AssemblerName.GL_TEXTURE, GlAssemblerController, ShaderAssemblerTexture);
		poly.assemblersRegister.register(AssemblerName.GL_VOLUME, GlAssemblerController, ShaderAssemblerVolume);
	}
}

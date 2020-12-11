import {AssemblerName} from "./_BaseRegister";
import {GlAssemblerController} from "../../../nodes/gl/code/Controller";
import {ShaderAssemblerBasic} from "../../../nodes/gl/code/assemblers/materials/Basic";
import {ShaderAssemblerLambert} from "../../../nodes/gl/code/assemblers/materials/Lambert";
import {ShaderAssemblerStandard} from "../../../nodes/gl/code/assemblers/materials/Standard";
import {ShaderAssemblerPoints} from "../../../nodes/gl/code/assemblers/materials/Points";
import {ShaderAssemblerParticles} from "../../../nodes/gl/code/assemblers/particles/Particles";
import {ShaderAssemblerTexture} from "../../../nodes/gl/code/assemblers/textures/Texture";
import {ShaderAssemblerVolume} from "../../../nodes/gl/code/assemblers/materials/Volume";
export class AllAssemblersRegister {
  static run(poly) {
    poly.assemblers_register.register_assembler(AssemblerName.GL_MESH_BASIC, GlAssemblerController, ShaderAssemblerBasic);
    poly.assemblers_register.register_assembler(AssemblerName.GL_MESH_LAMBERT, GlAssemblerController, ShaderAssemblerLambert);
    poly.assemblers_register.register_assembler(AssemblerName.GL_MESH_STANDARD, GlAssemblerController, ShaderAssemblerStandard);
    poly.assemblers_register.register_assembler(AssemblerName.GL_PARTICLES, GlAssemblerController, ShaderAssemblerParticles);
    poly.assemblers_register.register_assembler(AssemblerName.GL_POINTS, GlAssemblerController, ShaderAssemblerPoints);
    poly.assemblers_register.register_assembler(AssemblerName.GL_TEXTURE, GlAssemblerController, ShaderAssemblerTexture);
    poly.assemblers_register.register_assembler(AssemblerName.GL_VOLUME, GlAssemblerController, ShaderAssemblerVolume);
  }
}

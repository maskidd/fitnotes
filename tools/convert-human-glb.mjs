// Creates the small, static FitNotes hologram mesh from a CC0 A-pose base model.
// Source: https://www.innerscene.com/tools/library/3d-parts/male-base-mesh-3d-person-rigged-a-pose-380e6d89
// License: CC0 1.0 (Innerscene, adapted from MakeHuman CC0 assets).
// Usage: node tools/convert-human-glb.mjs /path/to/base_male.glb dist/human-silhouette.bin
import fs from 'node:fs';

const [source,target]=process.argv.slice(2);
if(!source||!target)throw new Error('Pass the source GLB and target binary paths');
const bytes=fs.readFileSync(source);
if(bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2)throw Error('Expected GLB v2');
const jsonLength=bytes.readUInt32LE(12);
const gltf=JSON.parse(bytes.toString('utf8',20,20+jsonLength));
const binaryChunk=20+jsonLength;
if(bytes.toString('ascii',binaryChunk+4,binaryChunk+7)!=='BIN')throw Error('Missing GLB BIN chunk');
const binaryStart=binaryChunk+8;
const body=gltf.meshes.find(mesh=>mesh.name==='base');
if(!body)throw Error('No anatomical base mesh in source GLB');
const primitive=body.primitives[0];
const accessorBytes=(accessorIndex,type)=>{
  const accessor=gltf.accessors[accessorIndex];
  if(accessor.componentType!==type||accessor.bufferView===undefined)throw Error('Unexpected accessor type');
  const view=gltf.bufferViews[accessor.bufferView];
  if(view.byteStride)throw Error('Interleaved buffers are not supported');
  const stride=type===5126?4:2;
  const channels=accessor.type==='VEC3'?3:1;
  const start=binaryStart+(view.byteOffset||0)+(accessor.byteOffset||0);
  return {accessor,bytes:bytes.subarray(start,start+accessor.count*stride*channels)};
};
const pos=accessorBytes(primitive.attributes.POSITION,5126);
const norm=accessorBytes(primitive.attributes.NORMAL,5126);
const idx=accessorBytes(primitive.indices,5123);
if(pos.accessor.count!==norm.accessor.count||pos.accessor.count>65535)throw Error('Unexpected body mesh');

const sourcePos=new Float32Array(pos.bytes.buffer,pos.bytes.byteOffset,pos.bytes.length/4);
const scaled=new Float32Array(sourcePos.length);
const sourceNormals=new Float32Array(norm.bytes.buffer,norm.bytes.byteOffset,norm.bytes.length/4);
const rotatedNormals=new Float32Array(sourceNormals.length);
const sourceIndices=new Uint16Array(idx.bytes.buffer,idx.bytes.byteOffset,idx.bytes.length/2);
const rotatedIndices=new Uint16Array(sourceIndices.length);
const min=pos.accessor.min,max=pos.accessor.max;
const center=[(min[0]+max[0])/2,(min[1]+max[1])/2,(min[2]+max[2])/2];
// Match the existing hologram framing: human proportions, centred on the origin.
const modelScale=2.34;
const smoothstep=(lo,hi,value)=>{
  const t=Math.max(0,Math.min(1,(value-lo)/(hi-lo)));
  return t*t*(3-2*t);
};
for(let i=0;i<sourcePos.length;i+=3){
  scaled[i]=(sourcePos[i]-center[0])*modelScale;
  scaled[i+1]=(sourcePos[i+1]-center[1])*modelScale;
  // FitNotes' front camera faces +Z; the MakeHuman source faces -Z.
  scaled[i+2]=-(sourcePos[i+2]-center[2])*modelScale;
  rotatedNormals[i]=sourceNormals[i];
  rotatedNormals[i+1]=sourceNormals[i+1];
  rotatedNormals[i+2]=-sourceNormals[i+2];

  // The hologram is a neutral silhouette, not a portrait. Blend the front
  // face into a softly curved, featureless skull while keeping the original
  // anatomical neck, ears, jaw boundary and three-dimensional head volume.
  const x=scaled[i],y=scaled[i+1],z=scaled[i+2];
  const faceBlend=smoothstep(1.63,1.79,y)*(1-smoothstep(2.015,2.105,y))
    *smoothstep(.155,.305,z)*(1-smoothstep(.17,.225,Math.abs(x)));
  if(faceBlend>.0001){
    const relativeX=x/.225,relativeY=(y-1.84)/.315;
    const dome=Math.sqrt(Math.max(.045,1-relativeX*relativeX-relativeY*relativeY));
    const surfaceZ=.16+.253*dome;
    scaled[i+2]=z+(surfaceZ-z)*faceBlend*.96;
    const nx=x/(.225*.225),ny=(y-1.84)/(.315*.315),nz=(surfaceZ-.16)/(.253*.253);
    const length=Math.hypot(nx,ny,nz)||1;
    const blend=faceBlend*.87;
    const px=rotatedNormals[i]*(1-blend)+nx/length*blend;
    const py=rotatedNormals[i+1]*(1-blend)+ny/length*blend;
    const pz=rotatedNormals[i+2]*(1-blend)+nz/length*blend;
    const normalLength=Math.hypot(px,py,pz)||1;
    rotatedNormals[i]=px/normalLength;
    rotatedNormals[i+1]=py/normalLength;
    rotatedNormals[i+2]=pz/normalLength;
  }
}
for(let i=0;i<sourceIndices.length;i+=3){
  rotatedIndices[i]=sourceIndices[i];
  rotatedIndices[i+1]=sourceIndices[i+2];
  rotatedIndices[i+2]=sourceIndices[i+1];
}
const header=Buffer.alloc(16);
header.write('FNHB',0,'ascii');
header.writeUInt32LE(1,4);
header.writeUInt32LE(pos.accessor.count,8);
header.writeUInt32LE(idx.accessor.count,12);
fs.writeFileSync(target,Buffer.concat([
  header,
  Buffer.from(scaled.buffer),
  Buffer.from(rotatedNormals.buffer),
  Buffer.from(rotatedIndices.buffer)
]));
console.log(`Wrote ${pos.accessor.count} anatomical vertices and ${idx.accessor.count/3} triangles to ${target}`);

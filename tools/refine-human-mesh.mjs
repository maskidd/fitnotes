// Refines FitNotes' existing public-domain human hologram mesh without
// replacing the body, material, proportions or interactive rotation.
// Usage: node tools/refine-human-mesh.mjs dist/human-silhouette.bin dist/human-silhouette-refined.bin
import fs from 'node:fs';

const [input,output]=process.argv.slice(2);
if(!input||!output)throw Error('Provide input and output .bin paths');
const source=fs.readFileSync(input);
if(source.toString('ascii',0,4)!=='FNHB'||source.readUInt32LE(4)!==1)throw Error('Invalid FitNotes mesh');
const count=source.readUInt32LE(8),indexCount=source.readUInt32LE(12);
const originalPositions=new Float32Array(source.buffer,source.byteOffset+16,count*3);
const originalNormals=new Float32Array(source.buffer,source.byteOffset+16+count*12,count*3);
const inputTriangles=new Uint16Array(source.buffer,source.byteOffset+16+count*24,indexCount);
const positions=Array.from(originalPositions),normals=Array.from(originalNormals);
const triangles=Array.from(inputTriangles);
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const blend=(a,b,t)=>a+(b-a)*t;
const smoothstep=(min,max,v)=>{const t=clamp((v-min)/(max-min),0,1);return t*t*(3-2*t);};
const normalise=(x,y,z)=>{const length=Math.hypot(x,y,z)||1;return [x/length,y/length,z/length];};

// Flatten residual face anatomy toward the curved cranial surface.
const faceSurface=(x,y)=>.416-2.4*x*x-1.25*(y-1.83)**2;
for(let i=0;i<count;i++){
  const offset=i*3;
  let x=positions[offset],y=positions[offset+1],z=positions[offset+2];

  // A relaxed A-pose: slightly wider than the prior refined version, without
  // returning to the source's fully extended arms.
  const arm=smoothstep(.44,1.05,Math.abs(x));
  x-=Math.sign(x)*.062*arm;
  y-=.032*arm;

  // Make both upper arms and forearms visibly but subtly fuller (roughly
  // 10–12% thicker in silhouette), without moving the hand or changing pose.
  // Inflating along each surface normal keeps anatomical curvature smooth.
  const armGirth=smoothstep(.43,.56,Math.abs(x))*smoothstep(.58,.86,y)*
    (1-smoothstep(1.29,1.42,y));
  const nx=normals[offset],ny=normals[offset+1],nz=normals[offset+2];
  const fullness=.026*armGirth;
  x+=nx*fullness;
  y+=ny*fullness;
  z+=nz*fullness;

  const face=smoothstep(1.62,1.73,y)*(1-smoothstep(1.985,2.067,y))*
    (1-smoothstep(.118,.178,Math.abs(x)))*smoothstep(.09,.27,z);
  if(face>.0001){
    z=blend(z,faceSurface(x,y),face*.985);
    const target=normalise(4.8*x,2.5*(y-1.83),1);
    const normalBlend=face*.98;
    const updated=normalise(
      blend(normals[offset],target[0],normalBlend),
      blend(normals[offset+1],target[1],normalBlend),
      blend(normals[offset+2],target[2],normalBlend)
    );
    normals[offset]=updated[0];normals[offset+1]=updated[1];normals[offset+2]=updated[2];
  }
  positions[offset]=x;positions[offset+1]=y;positions[offset+2]=z;
}

// Blur just the front pectoral microgeometry, preserving broad muscle shape.
// This removes nipple ridges without blurring the shoulders or sternum.
const adjacency=Array.from({length:count},()=>[]);
for(let t=0;t<inputTriangles.length;t+=3){
  const a=inputTriangles[t],b=inputTriangles[t+1],c=inputTriangles[t+2];
  adjacency[a].push(b,c);adjacency[b].push(a,c);adjacency[c].push(a,b);
}
const chestMask=i=>{
  const x=Math.abs(positions[i*3]),y=positions[i*3+1],z=positions[i*3+2];
  return smoothstep(.105,.185,x)*(1-smoothstep(.315,.405,x))*
    smoothstep(.885,.965,y)*(1-smoothstep(1.32,1.42,y))*
    smoothstep(.34,.45,z);
};
for(let pass=0;pass<15;pass++){
  const next=positions.slice(),newNormals=normals.slice();
  for(let i=0;i<count;i++){
    const mask=chestMask(i);
    if(mask<.005)continue;
    const base=i*3,neighbors=adjacency[i];
    let totalZ=0,totalNx=0,totalNy=0,totalNz=0,totalWeight=0;
    for(const j of neighbors){
      const other=j*3;
      // Do not average through the model into the back of the chest.
      if(Math.abs(positions[other+2]-positions[base+2])>.048)continue;
      totalZ+=positions[other+2];
      totalNx+=normals[other];totalNy+=normals[other+1];totalNz+=normals[other+2];
      totalWeight++;
    }
    if(totalWeight<2)continue;
    const strength=.68*mask;
    next[base+2]=blend(positions[base+2],totalZ/totalWeight,strength);
    const n=normalise(
      blend(normals[base],totalNx/totalWeight,strength),
      blend(normals[base+1],totalNy/totalWeight,strength),
      blend(normals[base+2],totalNz/totalWeight,strength)
    );
    newNormals[base]=n[0];newNormals[base+1]=n[1];newNormals[base+2]=n[2];
  }
  for(let k=0;k<positions.length;k++){
    positions[k]=next[k];
    normals[k]=newNormals[k];
  }
}

// Explicitly remove circular nipple relief AND its concentrated normal-field
// highlight. The original mesh can retain the highlight after vertex-only
// smoothing, which made the chest still look as though it had nipples.
for(let i=0;i<count;i++){
  const offset=i*3,x=positions[offset],y=positions[offset+1],z=positions[offset+2];
  if(z<.40)continue;
  const dx=Math.abs(x)-.235,dy=y-1.020;
  const distance=Math.hypot(dx,dy);
  const mask=1-smoothstep(.067,.151,distance);
  if(mask<.001)continue;
  const smoothSurface=.546-.88*(y-1.105)**2-.32*dx*dx;
  positions[offset+2]=blend(z,smoothSurface,mask*.99);
  const side=Math.sign(x)||1;
  const flatNormal=normalise(side*(.18+dx*.8),.10+(y-1.105)*1.2,1);
  const n=normalise(
    blend(normals[offset],flatNormal[0],mask*.95),
    blend(normals[offset+1],flatNormal[1],mask*.95),
    blend(normals[offset+2],flatNormal[2],mask*.95)
  );
  normals[offset]=n[0];normals[offset+1]=n[1];normals[offset+2]=n[2];
}

// A clean elliptical facial shell conceals the source's open mouth and jagged
// features. Low-relief closed lips, eyelids and a softened nose give the face a
// calm neutral expression, using the same translucent hologram material.
const faceCenter=[0,1.845],faceRadii=[.151,.171];
const segmentCount=40,ringCount=24;
const addVertex=(x,y,z,nx,ny,nz)=>{
  const id=positions.length/3,normal=normalise(nx,ny,nz);
  positions.push(x,y,z);normals.push(...normal);return id;
};
const gaussian=(x,y,cx,cy,sx,sy)=>Math.exp(-.5*(((x-cx)/sx)**2+((y-cy)/sy)**2));
const faceHeight=(x,y)=>{
  const radial=Math.hypot(x/faceRadii[0],(y-faceCenter[1])/faceRadii[1]);
  let relief=0;
  for(const side of [-1,1]){
    // Relaxed eyelids with barely raised brows: no dark painted eyes.
    relief+=.008*gaussian(x,y,side*.059,1.908,.035,.016);
    relief-=.018*gaussian(x,y,side*.059,1.894,.034,.009);
  }
  // A slight nose bridge and rounded tip, without exaggerated nostrils.
  relief+=.026*gaussian(x,y,0,1.834,.020,.043);
  relief+=.031*gaussian(x,y,0,1.797,.030,.019);
  // Closed, neutral lips; the old source's open mouth stays hidden.
  relief+=.010*gaussian(x,y,0,1.760,.053,.012);
  relief-=.020*gaussian(x,y,0,1.748,.053,.007);
  relief+=.010*gaussian(x,y,0,1.733,.049,.013);
  return faceSurface(x,y)+.015*(1-Math.min(1,radial)**4)+relief;
};
const faceVertex=(radius,angle)=>{
  const x=faceRadii[0]*radius*Math.cos(angle),y=faceCenter[1]+faceRadii[1]*radius*Math.sin(angle);
  const delta=.0035;
  const nx=-(faceHeight(x+delta,y)-faceHeight(x-delta,y))/(delta*2);
  const ny=-(faceHeight(x,y+delta)-faceHeight(x,y-delta))/(delta*2);
  return addVertex(x,y,faceHeight(x,y),nx,ny,1);
};
const centerVertex=faceVertex(0,0),rings=[];
for(let ring=1;ring<=ringCount;ring++){
  const row=[],radius=ring/ringCount;
  for(let j=0;j<segmentCount;j++)row.push(faceVertex(radius,2*Math.PI*j/segmentCount));
  rings.push(row);
}
for(let j=0;j<segmentCount;j++){
  triangles.push(centerVertex,rings[0][j],rings[0][(j+1)%segmentCount]);
}
for(let ring=1;ring<ringCount;ring++){
  const inner=rings[ring-1],outer=rings[ring];
  for(let j=0;j<segmentCount;j++){
    const next=(j+1)%segmentCount;
    triangles.push(inner[j],outer[j],outer[next],inner[j],outer[next],inner[next]);
  }
}

if(positions.length/3>65535)throw Error('Too many vertices for the 16-bit hologram format');
const outHeader=Buffer.alloc(16);
outHeader.write('FNHB',0,'ascii');outHeader.writeUInt32LE(1,4);
outHeader.writeUInt32LE(positions.length/3,8);outHeader.writeUInt32LE(triangles.length,12);
fs.writeFileSync(output,Buffer.concat([
  outHeader,
  Buffer.from(new Float32Array(positions).buffer),
  Buffer.from(new Float32Array(normals).buffer),
  Buffer.from(new Uint16Array(triangles).buffer)
]));
console.log(`Refined hologram: ${positions.length/3} vertices, ${triangles.length/3} triangles`);

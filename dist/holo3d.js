/* FitNotes — 3D neon hologram (Tripo-model, slanket). Kræver holo-mesh.bin + holo-tex.jpg. */
(() => {
  const VS = `
    attribute vec3 aPos; attribute vec2 aUv; attribute vec3 aNrm;
    uniform vec3 mn, mx; uniform float yaw, aspect, scale, time, glitch;
    varying vec2 vUv; varying vec3 vN; varying float vY;
    void main(){
      vec3 p=mn+aPos*(mx-mn);
      vY=(p.y-mn.y)/(mx.y-mn.y);
      p.y-=(mn.y+mx.y)*.5; p.xz-=(mn.xz+mx.xz)*.5;
      // glitch: thin horizontal slices jump sideways for a moment
      float band=step(.82,fract(sin(floor(vY*38.+floor(time*24.))*91.7)*43758.5));
      p.x+=glitch*band*.018*sin(time*90.);
      float c=cos(yaw),s=sin(yaw);
      vec3 r=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);
      vN=vec3(c*aNrm.x+s*aNrm.z,aNrm.y,-s*aNrm.x+c*aNrm.z);
      vUv=aUv;
      gl_Position=vec4(r.x*scale/aspect,r.y*scale,-r.z*.5,1.);
    }`;
  const FS = `
    precision highp float;
    uniform sampler2D tex; uniform vec3 bodyTint, rimTint, lineTint; uniform float time, scanY, glitch;
    varying vec2 vUv; varying vec3 vN; varying float vY;
    void main(){
      vec3 t=texture2D(tex,vUv).rgb;
      vec3 n=normalize(vN);
      float facing=abs(n.z), rim=pow(1.-facing,2.2);
      float line=t.r, body=t.g*(1.-t.b*.55);
      float scan=exp(-pow((vY-scanY)/.035,2.));
      float flick=1.-glitch*.35*step(.5,fract(time*31.));
      // lines carry the rank colour; only the brightest core turns white
      vec3 col=bodyTint*(.05+.15*body)*(.55+.45*facing)+rimTint*rim*.9+lineTint*line*1.3+vec3(.3)*pow(line,3.);
      col+=mix(lineTint,vec3(1.),.2)*scan*(.35+line*1.4);
      gl_FragColor=vec4(col*flick,1.);
    }`;

  const cache = {};
  let lastYaw = 0; // kept across re-renders so the view does not jump back
  function load(url, kind) {
    if (!cache[url]) cache[url] = kind === 'img'
      ? new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; })
      : url.startsWith('data:')
        ? Promise.resolve().then(() => { const bin = atob(url.slice(url.indexOf(',') + 1)), out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out.buffer; })
        : fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); });
    return cache[url];
  }
  function hex(c) { const n = parseInt(c.replace('#', ''), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
  // One rank colour by default; a rank can also give its body, edge and line colours separately.
  function palette(o) {
    const base = hex(o.color || '#88b9ff'), mixWhite = (c, k) => c.map(v => v + (1 - v) * k);
    return { body: o.body ? hex(o.body) : base, rim: o.rim ? hex(o.rim) : base, line: o.line ? hex(o.line) : mixWhite(base, .15) };
  }
  function compile(gl, type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  async function initHolo3D(canvas, opts = {}) {
    const meshUrl = opts.mesh || window.FITNOTES_HOLO_MESH || 'holo-mesh.bin';
    const texUrl = opts.texture || window.FITNOTES_HOLO_TEX || 'holo-tex.jpg';
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) throw new Error('webgl');
    const [buf, img] = await Promise.all([load(meshUrl), load(texUrl, 'img')]);
    const dv = new DataView(buf);
    if (String.fromCharCode(...new Uint8Array(buf, 0, 4)) !== 'FNH2') throw new Error('format');
    const nv = dv.getUint32(4, true), ni = dv.getUint32(8, true), ib = dv.getUint32(12, true);
    const f = i => dv.getFloat32(16 + i * 4, true), mn = [f(0), f(1), f(2)], mx = [f(3), f(4), f(5)];
    let o = 40;
    const pos = new Uint16Array(buf, o, nv * 3); o += nv * 6;
    const uv = new Uint16Array(buf, o, nv * 2); o += nv * 4;
    const nrm = new Int8Array(buf, o, nv * 4); o += nv * 4;
    if (ib === 4 && !gl.getExtension('OES_element_index_uint')) throw new Error('uint index');
    const idx = ib === 4 ? new Uint32Array(buf.slice(o, o + ni * 4)) : new Uint16Array(buf.slice(o, o + ni * 2));

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const attr = (name, data, size, type, norm, stride = 0) => {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const l = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, type, norm, stride, 0);
    };
    attr('aPos', pos, 3, gl.UNSIGNED_SHORT, true);
    attr('aUv', uv, 2, gl.UNSIGNED_SHORT, true);
    attr('aNrm', nrm, 3, gl.BYTE, true, 4);
    const ebo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const u = n => gl.getUniformLocation(prog, n);
    const loc = { mn: u('mn'), mx: u('mx'), yaw: u('yaw'), aspect: u('aspect'), scale: u('scale'), time: u('time'), glitch: u('glitch'), bodyTint: u('bodyTint'), rimTint: u('rimTint'), lineTint: u('lineTint'), scanY: u('scanY') };
    gl.uniform3fv(loc.mn, mn); gl.uniform3fv(loc.mx, mx);
    const idxType = ib === 4 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

    let colors = palette(opts), yaw = lastYaw, target = lastYaw, dead = false, raf = 0;
    let glitchUntil = 0, nextGlitch = performance.now() + 6000 + Math.random() * 2000;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const height = (mx[1] - mn[1]);
    function frame(ms) {
      if (dead) return;
      if (!canvas.isConnected) { dead = true; return; }
      const now = ms / 1000;
      const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      gl.viewport(0, 0, canvas.width, canvas.height);
      yaw += (target - yaw) * .12; lastYaw = target;
      if (!still && ms > nextGlitch) { glitchUntil = ms + 140 + Math.random() * 120; nextGlitch = ms + 6000 + Math.random() * 2000; }
      const g = !still && ms < glitchUntil ? 1 : 0;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(loc.yaw, yaw); gl.uniform1f(loc.aspect, w / h); gl.uniform1f(loc.scale, 1.72 / height);
      gl.uniform1f(loc.time, now); gl.uniform1f(loc.glitch, g); gl.uniform3fv(loc.bodyTint, colors.body); gl.uniform3fv(loc.rimTint, colors.rim); gl.uniform3fv(loc.lineTint, colors.line);
      gl.uniform1f(loc.scanY, still ? -1 : 1.15 - ((now / 4.5) % 1) * 1.3);
      // depth pre-pass then additive colour, so only the front surface glows
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); gl.colorMask(false, false, false, false); gl.disable(gl.BLEND);
      gl.drawElements(gl.TRIANGLES, ni, idxType, 0);
      gl.depthFunc(gl.LEQUAL); gl.colorMask(true, true, true, true); gl.depthMask(false);
      gl.drawElements(gl.TRIANGLES, ni, idxType, 0);
      gl.depthMask(true);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // drag to turn; buttons snap to fixed views
    let drag = null;
    canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, t: target }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (drag) target = drag.t + (e.clientX - drag.x) * .012; });
    const end = () => { drag = null; };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

    return {
      setColor(c, extra = {}) { colors = palette({ ...extra, color: c }); },
      setView(deg) { const t = deg * Math.PI / 180, k = Math.round((target - t) / (2 * Math.PI)); target = t + k * 2 * Math.PI; },
      destroy() { dead = true; cancelAnimationFrame(raf); }
    };
  }
  window.initHolo3D = initHolo3D;
})();

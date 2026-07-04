'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * AuroraHero — a raw-WebGL night sky.
 *
 * Two draw calls per frame:
 *  1. A fullscreen fragment shader: fbm-noise aurora curtains drifting over a
 *     near-black sky with twinkling stars. The aurora leans almost
 *     imperceptibly toward the cursor.
 *  2. The name, rasterized to an offscreen canvas, sampled into ~9k points
 *     rendered as soft additive particles. They assemble from a scattered
 *     cloud on load, then breathe in place; the cursor stirs them gently.
 *
 * No three.js — the whole scene is two shader programs.
 */

const AURORA_VERT = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const AURORA_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uFade;
uniform vec2 uMouse; // 0..1, smoothed

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p = p * 2.03 + vec2(13.7, 7.1);
    amp *= 0.5;
  }
  return v;
}

float stars(vec2 uv, float scale, float t) {
  vec2 g = uv * scale;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(id);
  vec2 offset = vec2(hash(id + 17.0), hash(id + 31.0)) - 0.5;
  float d = length(f - offset * 0.8);
  float twinkle = 0.55 + 0.45 * sin(t * (0.6 + h * 2.4) + h * 43.0);
  return smoothstep(0.06, 0.0, d) * step(0.93, h) * twinkle;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.05;

  // night sky base
  vec3 col = vec3(0.039, 0.039, 0.059); // #0a0a0f
  col += vec3(0.020, 0.012, 0.050) * fbm(p * 1.4 + t * 0.4) * (1.0 - uv.y) * 0.8;

  // the cursor nudges the noise field, so the whole sky leans toward it
  vec2 lean = (uMouse - 0.5) * 0.12;

  // three aurora curtains
  vec3 tealC   = vec3(0.176, 0.831, 0.749);
  vec3 violetC = vec3(0.545, 0.361, 0.965);
  vec3 greenC  = vec3(0.290, 0.871, 0.502);

  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float seed = fi * 7.31;
    float q = p.x * (1.1 + fi * 0.35) + seed + t * (0.5 + fi * 0.22);
    float center = 0.74 - fi * 0.12
      + (fbm(vec2(q, t * 0.6 + seed)) - 0.5) * 0.45
      + lean.y * 0.4;
    float d = uv.y - center;
    // bright lower edge with a long tail fading upward, like real curtains
    float curtain = d > 0.0 ? exp(-d * 7.0) : exp(d * 26.0);
    // vertical rays
    float rays = 0.45 + 0.55 * fbm(vec2(q * 3.2 + lean.x, t * 0.8 + seed));
    float strength = curtain * rays * (0.30 - fi * 0.06);
    vec3 bandColor = i == 0 ? tealC : (i == 1 ? violetC : greenC);
    col += bandColor * strength;
  }

  // stars, dimmer toward the horizon glow
  float starMask = smoothstep(0.15, 0.65, uv.y);
  col += vec3(0.85, 0.9, 1.0) * stars(p, 22.0, uTime) * 0.5 * starMask;
  col += vec3(0.9, 0.92, 1.0) * stars(p + 4.7, 47.0, uTime) * 0.25 * starMask;

  // vignette
  float vig = 1.0 - 0.4 * length(uv - vec2(0.5, 0.45));
  col *= vig;

  // fade in from black, dither against banding on the dark gradient
  col *= uFade;
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 160.0;

  gl_FragColor = vec4(col, 1.0);
}
`

const PARTICLE_VERT = /* glsl */ `
attribute vec2 aTarget; // drawing-buffer px
attribute vec3 aSeed;   // [0,1) randoms
uniform vec2 uRes;      // drawing-buffer px
uniform float uTime;
uniform float uIntro;   // 0..1, eased on CPU
uniform vec2 uMouse;    // drawing-buffer px, smoothed
uniform float uDpr;
varying float vSeed;
varying float vTw;

void main() {
  float s1 = aSeed.x;
  float s2 = aSeed.y;

  // scattered birth position: a wide ring around the center
  vec2 center = uRes * 0.5;
  float ang = s1 * 6.28318;
  float rad = (0.3 + s2 * 0.9) * max(uRes.x, uRes.y) * 0.75;
  vec2 start = center + vec2(cos(ang), sin(ang)) * rad;
  vec2 pos = mix(start, aTarget, uIntro);

  // ambient breathing drift, a couple of px
  pos += vec2(
    sin(uTime * (0.35 + s1 * 0.5) + s1 * 40.0),
    cos(uTime * (0.30 + s2 * 0.5) + s2 * 40.0)
  ) * (1.0 + s2 * 1.7) * uDpr * uIntro;

  // gentle stir away from the cursor, with a hint of swirl
  vec2 d = pos - uMouse;
  float dist = length(d) + 1e-4;
  float force = smoothstep(140.0 * uDpr, 0.0, dist);
  vec2 dir = d / dist;
  pos += (dir * 16.0 + vec2(-dir.y, dir.x) * 9.0) * force * uDpr * uIntro;

  vec2 clip = (pos / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  vTw = 0.7 + 0.3 * sin(uTime * (0.8 + s1 * 2.2) + s2 * 31.0);
  gl_PointSize = (1.2 + aSeed.z * 1.6) * uDpr * vTw * (0.4 + 0.6 * uIntro);
  vSeed = s1;
}
`

const PARTICLE_FRAG = /* glsl */ `
precision mediump float;
varying float vSeed;
varying float vTw;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.08, length(c));
  vec3 teal   = vec3(0.176, 0.831, 0.749);
  vec3 violet = vec3(0.545, 0.361, 0.965);
  vec3 green  = vec3(0.290, 0.871, 0.502);
  vec3 tint = vSeed < 0.5
    ? mix(teal, violet, vSeed * 2.0)
    : mix(violet, green, (vSeed - 0.5) * 2.0);
  // mostly moonlight-white, kissed by the aurora
  vec3 col = mix(vec3(0.93, 0.96, 0.98), tint, 0.38);
  gl_FragColor = vec4(col, a * vTw * 0.9);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed')
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext, vert: string, frag: string) {
  const program = gl.createProgram()!
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vert))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'program link failed')
  }
  return program
}

/** Rasterize the name and sample lit pixels into particle target positions. */
function sampleText(
  text: string,
  width: number,
  height: number,
  dpr: number,
  fontFamily: string,
): Float32Array {
  const cssW = width / dpr
  const lines = cssW >= 600 || text.length <= 10 ? [text] : text.split(' ')

  const off = document.createElement('canvas')
  off.width = width
  off.height = height
  const ctx = off.getContext('2d', { willReadFrequently: true })!

  const probe = 100
  ctx.font = `600 ${probe}px ${fontFamily}`
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width))
  const maxW = Math.min(cssW * 0.86, 880) * dpr
  const fontPx = Math.max(
    40 * dpr,
    Math.min((probe * maxW) / widest, 190 * dpr),
  )

  ctx.font = `600 ${fontPx}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  const lineHeight = fontPx * 1.04
  const blockCenter = height * 0.46
  const firstY = blockCenter - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, firstY + i * lineHeight)
  })

  const data = ctx.getImageData(0, 0, width, height).data

  // estimate lit-pixel count on a coarse grid, derive a stride for ~9k points
  let coarse = 0
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      if (data[(y * width + x) * 4 + 3] > 128) coarse++
    }
  }
  const lit = coarse * 16
  const budget = 9000
  const stride = Math.max(2, Math.ceil(Math.sqrt(lit / budget)))

  const points: number[] = []
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      if (data[(y * width + x) * 4 + 3] > 128) {
        points.push(
          x + (Math.random() - 0.5) * stride,
          y + (Math.random() - 0.5) * stride,
          Math.random(),
          Math.random(),
          Math.random(),
        )
      }
    }
  }
  return new Float32Array(points)
}

export function AuroraHero({ text = 'Stefan Wullems' }: { text?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
    })
    if (!gl) {
      setFailed(true)
      return
    }

    let raf = 0
    let disposed = false
    let particleCount = 0
    let particleBuffer: WebGLBuffer | null = null

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let auroraProg: WebGLProgram
    let particleProg: WebGLProgram
    try {
      auroraProg = createProgram(gl, AURORA_VERT, AURORA_FRAG)
      particleProg = createProgram(gl, PARTICLE_VERT, PARTICLE_FRAG)
    } catch {
      setFailed(true)
      return
    }

    // fullscreen triangle
    const triBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, triBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )

    const aPos = gl.getAttribLocation(auroraProg, 'aPos')
    const aurora = {
      uRes: gl.getUniformLocation(auroraProg, 'uRes'),
      uTime: gl.getUniformLocation(auroraProg, 'uTime'),
      uFade: gl.getUniformLocation(auroraProg, 'uFade'),
      uMouse: gl.getUniformLocation(auroraProg, 'uMouse'),
    }
    const aTarget = gl.getAttribLocation(particleProg, 'aTarget')
    const aSeed = gl.getAttribLocation(particleProg, 'aSeed')
    const particle = {
      uRes: gl.getUniformLocation(particleProg, 'uRes'),
      uTime: gl.getUniformLocation(particleProg, 'uTime'),
      uIntro: gl.getUniformLocation(particleProg, 'uIntro'),
      uMouse: gl.getUniformLocation(particleProg, 'uMouse'),
      uDpr: gl.getUniformLocation(particleProg, 'uDpr'),
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0

    // mouse starts far offscreen so nothing reacts until it moves
    const mouse = { x: -1e5, y: -1e5, tx: -1e5, ty: -1e5 }
    let time = 0
    let intro = reducedMotion ? 1 : 0
    let fade = reducedMotion ? 1 : 0
    let last = performance.now()

    function resolveFontFamily() {
      return getComputedStyle(canvas!).fontFamily || 'serif'
    }

    function rebuildParticles() {
      if (width === 0 || height === 0) return
      const targets = sampleText(text, width, height, dpr, resolveFontFamily())
      particleCount = targets.length / 5
      if (!particleBuffer) particleBuffer = gl!.createBuffer()
      gl!.bindBuffer(gl!.ARRAY_BUFFER, particleBuffer)
      gl!.bufferData(gl!.ARRAY_BUFFER, targets, gl!.STATIC_DRAW)
    }

    function resize() {
      const w = Math.round(canvas!.clientWidth * dpr)
      const h = Math.round(canvas!.clientHeight * dpr)
      if (w === width && h === height) return
      width = w
      height = h
      canvas!.width = w
      canvas!.height = h
      gl!.viewport(0, 0, w, h)
      rebuildParticles()
    }

    function draw() {
      gl!.disable(gl!.BLEND)
      gl!.useProgram(auroraProg)
      gl!.bindBuffer(gl!.ARRAY_BUFFER, triBuffer)
      gl!.enableVertexAttribArray(aPos)
      gl!.vertexAttribPointer(aPos, 2, gl!.FLOAT, false, 0, 0)
      gl!.uniform2f(aurora.uRes, width, height)
      gl!.uniform1f(aurora.uTime, time)
      gl!.uniform1f(aurora.uFade, fade)
      gl!.uniform2f(
        aurora.uMouse,
        mouse.x > -1e4 ? mouse.x / width : 0.5,
        mouse.y > -1e4 ? 1 - mouse.y / height : 0.5,
      )
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
      gl!.disableVertexAttribArray(aPos)

      if (particleCount > 0) {
        gl!.enable(gl!.BLEND)
        gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE)
        gl!.useProgram(particleProg)
        gl!.bindBuffer(gl!.ARRAY_BUFFER, particleBuffer)
        gl!.enableVertexAttribArray(aTarget)
        gl!.enableVertexAttribArray(aSeed)
        gl!.vertexAttribPointer(aTarget, 2, gl!.FLOAT, false, 20, 0)
        gl!.vertexAttribPointer(aSeed, 3, gl!.FLOAT, false, 20, 8)
        gl!.uniform2f(particle.uRes, width, height)
        gl!.uniform1f(particle.uTime, time)
        gl!.uniform1f(particle.uIntro, 1 - Math.pow(1 - intro, 3))
        gl!.uniform2f(particle.uMouse, mouse.x, mouse.y)
        gl!.uniform1f(particle.uDpr, dpr)
        gl!.drawArrays(gl!.POINTS, 0, particleCount)
        gl!.disableVertexAttribArray(aTarget)
        gl!.disableVertexAttribArray(aSeed)
      }
    }

    function frame(now: number) {
      if (disposed) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      time += dt
      intro = Math.min(1, intro + dt / 2.6)
      fade = Math.min(1, fade + dt / 1.8)
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 5)
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 5)
      draw()
      raf = requestAnimationFrame(frame)
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      const x = (e.clientX - rect.left) * dpr
      const y = (e.clientY - rect.top) * dpr
      if (mouse.tx < -1e4) {
        mouse.x = x
        mouse.y = y
      }
      mouse.tx = x
      mouse.ty = y
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else if (!disposed && !reducedMotion) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    let resizeTimer = 0
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        resize()
        if (reducedMotion) draw()
      }, 150)
    })

    function start() {
      if (disposed) return
      resize()
      resizeObserver.observe(canvas!)
      if (reducedMotion) {
        time = 24 // a pleasant moment of the night
        draw()
        return
      }
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('visibilitychange', onVisibility)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    // wait for the display font so the rasterized name isn't a fallback serif
    document.fonts.ready.then(start).catch(start)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [text])

  if (failed) {
    return (
      <div className="absolute inset-0 bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_20%,rgba(45,212,191,0.14),transparent),radial-gradient(ellipse_50%_40%_at_70%_45%,rgba(139,92,246,0.10),transparent)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden="true"
            className="font-display text-5xl font-semibold text-zinc-100 sm:text-7xl"
          >
            {text}
          </span>
        </div>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="font-display absolute inset-0 h-full w-full"
    />
  )
}

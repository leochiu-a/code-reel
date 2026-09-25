"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

// A dot-grid terrain that rolls like a waveform behind the hero. It is purely
// decorative: the canvas is aria-hidden and every word of copy stays in the
// server-rendered HTML, so crawlers and the LCP element never wait on WebGL.

const COLUMNS = 140;
const ROWS = 70;
const SPACING = 0.32;

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  varying float vHeight;
  varying float vDepth;

  void main() {
    vec3 p = position;
    float wave =
      sin(p.x * 0.35 + uTime * 0.6) * 0.45 +
      sin(p.z * 0.5 + uTime * 0.8) * 0.3 +
      sin((p.x + p.z) * 0.18 - uTime * 0.4) * 0.6;
    float pointerPull = exp(-distance(p.xz, uPointer) * 0.35) * 1.2;
    p.y += wave + pointerPull;
    vHeight = p.y;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.2 + pointerPull * 2.0) * uPixelRatio * (12.0 / vDepth);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vHeight;
  varying float vDepth;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float mixAmount = smoothstep(-1.2, 1.6, vHeight);
    vec3 color = mix(uColorA, uColorB, mixAmount);
    float fog = smoothstep(26.0, 6.0, vDepth);
    float alpha = (1.0 - d * 2.0) * fog * 0.85;
    gl_FragColor = vec4(color, alpha);
  }
`;

const buildGrid = () => {
  const positions = new Float32Array(COLUMNS * ROWS * 3);
  let i = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      positions[i++] = (col - COLUMNS / 2) * SPACING;
      positions[i++] = 0;
      positions[i++] = (row - ROWS / 2) * SPACING;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return geometry;
};

type HeroSceneProps = {
  onReady?: () => void;
};

export default function HeroScene({ onReady }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // No WebGL: the static gradient behind the canvas is enough.
    }
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 3.2, 9);
    camera.lookAt(0, 0, -2);

    const geometry = buildGrid();
    const material = new ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: [0, 0] },
        uPixelRatio: { value: pixelRatio },
        uColorA: { value: new Color("#7c3aed") },
        uColorB: { value: new Color("#f59e6b") },
      },
    });
    scene.add(new Points(geometry, material));

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Pointer target in grid space; the rendered value eases toward it.
    const pointerTarget = [0, 0];
    const pointer = [0, 0];
    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      pointerTarget[0] = nx * 18;
      pointerTarget[1] = ny * 10;
    };

    let frame = 0;
    let visible = true;
    const start = performance.now();

    const render = () => {
      material.uniforms.uTime.value = (performance.now() - start) / 1000;
      pointer[0] += (pointerTarget[0] - pointer[0]) * 0.05;
      pointer[1] += (pointerTarget[1] - pointer[1]) * 0.05;
      material.uniforms.uPointer.value = pointer;
      camera.position.x = pointer[0] * 0.04;
      camera.lookAt(0, 0, -2);
      renderer.render(scene, camera);
    };

    const loop = () => {
      render();
      frame = visible ? requestAnimationFrame(loop) : 0;
    };

    // Stop drawing once the hero scrolls out of view.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame && !reduceMotion) frame = requestAnimationFrame(loop);
    });

    render();
    onReady?.();
    if (!reduceMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      intersectionObserver.observe(container);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onReady]);

  return <div ref={containerRef} className="absolute inset-0 [&>canvas]:size-full" />;
}

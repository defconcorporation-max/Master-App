'use client';

import React, { useRef, useMemo, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, Float, Environment, ContactShadows, useGLTF, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping, Vignette, BrightnessContrast, SMAA } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { X, ExternalLink, Hammer, PenTool, Box, Truck, Zap, Activity } from 'lucide-react';

// ════════════════════════════════════════════════════════
// PREMIUM ASSET LOADER (With Fallback)
// ════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════
// PREMIUM ASSET LOADER (With Robust Fallback)
// ════════════════════════════════════════════════════════
const Robot = ({ position, color }: { position: [number, number, number], color: string }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.05;
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position} ref={ref}>
       {/* PROCEDURAL GLASS ARCHITECT (The 'Living' Element) */}
       <mesh position={[0, 0.75, 0]} castShadow>
         <capsuleGeometry args={[0.25, 1.2, 4, 16]} />
         <meshPhysicalMaterial 
            color={color} 
            transmission={0.9} 
            thickness={2} 
            roughness={0} 
            emissive={color}
            emissiveIntensity={0.5}
            transparent 
            opacity={0.6} 
         />
       </mesh>
       <mesh position={[0, 1.8, 0]} castShadow>
         <sphereGeometry args={[0.3, 16, 16]} />
         <meshPhysicalMaterial color={color} transmission={1} roughness={0} />
       </mesh>
       <mesh position={[0, 0.1, 0.4]}>
          <boxGeometry args={[0.1, 0.1, 0.6]} />
          <meshBasicMaterial color={color} />
       </mesh>
       {/* Subtle Glow at base */}
       <pointLight position={[0, 0, 0]} intensity={2} color={color} distance={2} />
    </group>
  );
};

// ════════════════════════════════════════════════════════
// DATA LINE (Glowing Transport Lane)
// ════════════════════════════════════════════════════════
const DataLine = ({ start, end, color }: { start: [number, number, number], end: [number, number, number], color: string }) => {
  const lineRef = useRef<THREE.Line>(null);
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(start[0], start[1] + 5, start[2]), // Arc up
    new THREE.Vector3(end[0], end[1] + 5, end[2]),
    new THREE.Vector3(...end)
  ], [start, end]);

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 32, 0.1, 8, false);

    return (
      <mesh geometry={tubeGeometry} ref={lineRef as any}>
        <meshBasicMaterial color={color} transparent opacity={0.5} />
        <pointLight intensity={1} distance={5} color={color} />
      </mesh>
    );
  };

// ════════════════════════════════════════════════════════
// CRATE STACKS (Scaling Task Piles)
// ════════════════════════════════════════════════════════
const CrateStack = ({ position, count, color }: { position: [number, number, number], count: number, color: string }) => {
  const crates = useMemo(() => {
    return Array.from({ length: Math.min(count, 12) }).map((_, i) => ({
      pos: [
        position[0] + (i % 3) * 1.2 - 1.2,
        position[1] + Math.floor(i / 3) * 0.8,
        position[2] + (Math.floor(i / 3) % 2) * 0.2
      ] as [number, number, number],
      rotOffset: Math.random() * 0.1
    }));
  }, [position, count]);

  return (
    <group>
      {crates.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={[0, c.rotOffset, 0]} castShadow>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshPhysicalMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
};

// ════════════════════════════════════════════════════════
// DISTRICT HUB (Ultra-Dense Living Node)
// ════════════════════════════════════════════════════════
const DistrictHub = ({ position, name, revenue, tasks, color }: {
  position: [number, number, number], name: string, revenue: number, tasks: any[], color: string
}) => {
  const height = Math.max(8, (revenue / 10000) * 2);
  const taskCount = tasks.length;
  
  return (
    <group position={position}>
      {/* Central Architecture */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[4, height, 4]} />
        <meshPhysicalMaterial color={color} transmission={0.9} thickness={2} roughness={0.1} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, height, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.5, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>

      {/* Scaffolding Detail */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[4.2, height + 0.5, 4.2]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.1} />
      </mesh>

      {/* Infrastructure Extras (Detail Density) */}
      <mesh position={[0, height + 1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, height + 3, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#fff" />
        <pointLight intensity={2} color={color} distance={4} />
      </mesh>

      {/* Living Workshop Pavilions */}
      <group position={[0, 0, 0]}>
        <JewelryPavilion position={[-6, 0, -6]} label="Studio A" icon={PenTool} color={color} isActive={taskCount > 0} />
        <JewelryPavilion position={[6, 0, -6]} label="Studio B" icon={Box} color={color} isActive={taskCount > 2} />
        <JewelryPavilion position={[-6, 0, 6]} label="Ops 1" icon={Hammer} color={color} isActive={taskCount > 4} />
        <JewelryPavilion position={[6, 0, 6]} label="Shipping" icon={Truck} color={color} isActive={taskCount > 6} />
      </group>

      {/* Crate Stacks (Piles of tasks) */}
      <CrateStack position={[0, 0, 7]} count={taskCount} color={color} />

      {/* Personnel (Artists) */}
      {Array.from({ length: Math.min(taskCount, 5) }).map((_, i) => (
        <Robot key={i} position={[
          Math.sin(i * 1.5) * 5, 
          0, 
          Math.cos(i * 1.5) * 5
        ]} color={color} />
      ))}

      {/* Data Transmission To HQ */}
      <DataLine start={[0, height, 0]} end={[0, 5, 0]} color={color} />

      {/* Labels */}
      <Html position={[0, height + 6, 0]} center>
         <div style={{
           background: 'rgba(2, 6, 23, 0.95)', border: `1px solid ${color}80`,
           borderRadius: '12px', padding: '16px 32px', color: '#fff',
           fontFamily: 'monospace', textAlign: 'center', backdropFilter: 'blur(20px)',
           boxShadow: `0 0 40px ${color}30`
         }}>
           <div style={{ color, fontSize: '11px', fontWeight: 'bold', letterSpacing: '5px' }}>{name}</div>
           <div style={{ fontSize: '32px', fontWeight: '900' }}>${(revenue/1000).toFixed(0)}K</div>
           <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '5px' }}>{taskCount} ACTIVE OPERATIONS</div>
         </div>
      </Html>
    </group>
  );
};

// ════════════════════════════════════════════════════════
// REUSABLE PAVILION
// ════════════════════════════════════════════════════════
const JewelryPavilion = ({ position, label, icon: Icon, color, isActive }: { 
  position: [number, number, number], label: string, icon: any, color: string, isActive: boolean 
}) => (
  <group position={position}>
    <mesh position={[0, 1, 0]} castShadow>
      <boxGeometry args={[3, 2, 3]} />
      <meshPhysicalMaterial color={isActive ? color : '#fff'} transmission={1} thickness={1} opacity={isActive ? 0.6 : 0.2} transparent />
    </mesh>
    <mesh position={[0, 2.1, 0]}>
       <boxGeometry args={[3.2, 0.2, 3.2]} />
       <meshStandardMaterial color="#0f172a" />
    </mesh>
    <Html position={[0, 3, 0]} center>
      <div style={{
          background: 'rgba(2,6,23,0.8)', padding: '4px 8px', borderRadius: '4px',
          border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`,
          color: isActive ? '#fff' : '#64748b', fontSize: '9px', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        <Icon size={10} /> {label}
      </div>
    </Html>
  </group>
);

// ════════════════════════════════════════════════════════
// MAIN SCENE
// ════════════════════════════════════════════════════════
export default function CityHallScene({ stats, tasks }: { stats?: any, tasks?: any[] }) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const auclaireTasks = safeTasks.filter(t => t.appName === 'Auclaire APP');
  const vegasTasks = safeTasks.filter(t => t.appName === 'Viva Vegas');
  const defconTasks = safeTasks.filter(t => t.appName === 'Defcon App');
  const drsTasks = safeTasks.filter(t => t.appName === 'DRS Auto Detailing');

  const aucRev = stats?.auclaire?.financials?.collected || 0;
  const vegRev = stats?.antigravity?.financials?.collected || 0;
  const defRev = stats?.defcon?.financials?.collected || 0;
  const drsRev = stats?.drs?.financials?.collected || 0;

  const totalRev = aucRev + vegRev + defRev + drsRev;

    return (
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        
        {/* PREMIUM ACTION HUD */}
        {selectedTask && (
          <div style={{
            position: 'absolute', top: '40px', right: '40px', width: '450px',
            background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(40px)',
            border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '24px',
            padding: '32px', color: '#fff', zIndex: 1000, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: selectedTask.priority === 'critical' ? '#ef4444' : '#38bdf8', boxShadow: `0 0 10px ${selectedTask.priority === 'critical' ? '#ef4444' : '#38bdf8'}` }} />
                  <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', opacity: 0.6 }}>MISSION BRIEF</span>
                </div>
                <button onClick={() => setSelectedTask(null)} style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
             </div>

             <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', lineHeight: 1.2 }}>{selectedTask.title}</h2>
             <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>ID: {selectedTask.id} • {selectedTask.appName}</div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px' }}>
                   <div style={{ fontSize: '10px', opacity: 0.4, marginBottom: '4px' }}>STATUS</div>
                   <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>{selectedTask.status?.toUpperCase() || 'ACTIVE'}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px' }}>
                   <div style={{ fontSize: '10px', opacity: 0.4, marginBottom: '4px' }}>DEADLINE</div>
                   <div style={{ fontWeight: 'bold' }}>{selectedTask.deadline || 'ASAP'}</div>
                </div>
             </div>

             <button style={{
               width: '100%', padding: '18px', borderRadius: '14px', border: 'none',
               background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
               color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
               boxShadow: '0 10px 20px -5px rgba(56, 189, 248, 0.4)'
             }}>
               DEPLOY WORKFORCE <ExternalLink size={18} />
             </button>
          </div>
        )}

      <Canvas shadows camera={{ position: [80, 90, 80], fov: 40 }} dpr={[1, 2]}>
        <color attach="background" args={['#020617']} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 20, 0]} intensity={2} color="#38bdf8" />
          <directionalLight position={[100, 200, 100]} intensity={3} castShadow shadow-mapSize={4096} />
          <Environment preset="night" />

          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={2048}
              mixBlur={1}
              mixStrength={40}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#050505"
              metalness={0.5} mirror={0}            />
          </mesh>
          <gridHelper args={[600, 120, '#1e293b', '#0f172a']} position={[0, 0.01, 0]} />

          {/* Central HQ (The Hub) */}
          <group position={[0, 3, 0]}>
            <mesh castShadow>
              <octahedronGeometry args={[8, 1]} />
              <meshPhysicalMaterial color="#38bdf8" transmission={1} roughness={0} thickness={4} />
            </mesh>
            <pointLight intensity={10} color="#38bdf8" distance={50} />
            <Html position={[0, 16, 0]} center>
              <div style={{
                background: 'rgba(2, 6, 23, 0.95)', border: '3px solid #38bdf8',
                borderRadius: '24px', padding: '32px 64px', color: '#fff', textAlign: 'center',
                backdropFilter: 'blur(30px)', boxShadow: '0 0 100px rgba(56,189,248,0.4)'
              }}>
                <div style={{ fontSize: '14px', color: '#38bdf8', letterSpacing: '8px', fontWeight: '900' }}>EMPIRE TOTAL</div>
                <div style={{ fontSize: '64px', fontWeight: '900', fontFamily: 'monospace' }}>${(totalRev/1000).toFixed(0)}K</div>
              </div>
            </Html>
          </group>

          {/* Districts (Ultra Density) */}
          <DistrictHub position={[-50, 0, -50]} name="AUCLAIRE" revenue={aucRev} tasks={auclaireTasks} color="#d97706" />
          <DistrictHub position={[50, 0, -50]} name="VEGAS" revenue={vegRev} tasks={vegasTasks} color="#a855f7" />
          <DistrictHub position={[-50, 0, 50]} name="DEFCON" revenue={defRev} tasks={defconTasks} color="#ef4444" />
          <DistrictHub position={[50, 0, 50]} name="DRS" revenue={drsRev} tasks={drsTasks} color="#eab308" />

          {/* Active Ops Orbitals */}
          {safeTasks.slice(0, 30).map((t, i) => (
            <Float key={t.id} speed={2} rotationIntensity={2} floatIntensity={2} position={[
              Math.sin(i * 0.5) * (70 + (i%5)*5), 
              10 + Math.random() * 20, 
              Math.cos(i * 0.5) * (70 + (i%5)*5)
            ]}>
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={t.priority === 'critical' ? '#ef4444' : '#38bdf8'} emissive={t.priority === 'critical' ? '#ef4444' : '#38bdf8'} emissiveIntensity={1} />
              </mesh>
            </Float>
          ))}

          <EffectComposer>
            <SMAA />
            <Bloom luminanceThreshold={0.5} intensity={2.5} levels={9} mipmapBlur />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>

          <OrbitControls enableDamping maxPolarAngle={Math.PI / 2.3} minDistance={50} maxDistance={300} />
        </Suspense>
      </Canvas>
    </div>
  );
}

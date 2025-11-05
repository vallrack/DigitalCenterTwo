
// src/app/odontology/odontogram-3d.tsx
import React, { Suspense, useRef, useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';
import { OdontogramState, Condition, Patient } from '@/lib/types';
import { conditions as initialConditions } from './conditions-data';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateDetailedOdontogramPDF } from './detailed-odontogram-print';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// --- Funciones de Ayuda ---

function createToothSymbolTexture(condition: Condition): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.0)';
    ctx.fillRect(0, 0, size, size);
    const symbol = condition.symbol;
    const color = condition.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const center = size / 2;
    switch (condition.type) {
        case 'text':
            ctx.font = `bold ${size * 0.9}px Arial`;
            ctx.fillStyle = color;
            ctx.fillText(symbol, center, center);
            break;
        case 'circle':
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(center, center, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            break;
        default:
            ctx.font = `bold ${size * 0.9}px Arial`;
            ctx.fillStyle = color;
            ctx.fillText(symbol, center, center);
    }
    return new THREE.CanvasTexture(canvas);
}

// --- Componentes de la Interfaz de Usuario ---

const Panel: React.FC<{ title: string; children: React.ReactNode; position: string; isCollapsed: boolean; onToggle: () => void; }> = ({ title, children, position, isCollapsed, onToggle }) => {
    const Icon = isCollapsed ? ChevronUp : ChevronDown;
    return (
        <div className={cn(
            "absolute pointer-events-auto flex flex-col transition-all duration-300 ease-in-out",
            "bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl",
            position,
            isCollapsed ? 'w-48' : 'w-auto max-w-xs'
        )}>
            <div className="flex items-center p-2 cursor-pointer border-b border-gray-300 dark:border-gray-600" onClick={onToggle}>
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200 flex-grow">{title}</h3>
                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            {!isCollapsed && <div className="p-3 overflow-y-auto max-h-[70vh]">{children}</div>}
        </div>
    );
};

// --- Componentes de Three.js ---

interface ToothProps {
  number: number;
  position: [number, number, number];
  scale?: number;
  conditions: OdontogramState[keyof OdontogramState];
  onClick: (toothNumber: number) => void;
  onHover: (toothNumber: number | null) => void;
  onCreated: (tooth: THREE.Group) => void;
}

const toothMaterial = new THREE.MeshStandardMaterial({ color: '#f0f0f0', roughness: 0.9, metalness: 0.1 });
const hoverMaterial = new THREE.MeshStandardMaterial({ color: '#a7c7e7', roughness: 0.9, metalness: 0.1 });

function Tooth({ number, position, scale = 1, conditions, onClick, onHover, onCreated }: ToothProps) {
    const groupRef = useRef<THREE.Group>(null!);
    useEffect(() => {
      if (groupRef.current) {
        onCreated(groupRef.current);
      }
    }, [onCreated]);

    const [isHovered, setIsHovered] = useState(false);
    
    const crownHeight = 1.0;
    const rootHeight = 1.2;
    const crownSize = 0.7; // Radio para el cono y lado para el cubo

    const SIDES = {
        vestibular: { pos: [0, crownHeight / 2, crownSize], rot: [0, 0, 0] },
        lingual:    { pos: [0, crownHeight / 2, -crownSize], rot: [0, Math.PI, 0] },
        mesial:     { pos: [-crownSize, crownHeight / 2, 0], rot: [0, -Math.PI / 2, 0] },
        distal:     { pos: [crownSize, crownHeight / 2, 0], rot: [0, Math.PI / 2, 0] },
        oclusal:    { pos: [0, crownHeight + 0.01, 0], rot: [-Math.PI / 2, 0, 0] }
    };

    return (
        <group
            ref={groupRef}
            position={position}
            scale={[scale, scale, scale]}
            onClick={(e) => { e.stopPropagation(); onClick(number); }}
            onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); onHover(number); }}
            onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); onHover(null); }}
        >
            <group>
                <mesh material={isHovered ? hoverMaterial : toothMaterial} position={[0, crownHeight / 2, 0]}>
                    <boxGeometry args={[crownSize * 2, crownHeight, crownSize * 2]} />
                </mesh>
                <mesh material={isHovered ? hoverMaterial : toothMaterial} position={[0, -rootHeight / 2, 0]}>
                    <coneGeometry args={[crownSize, rootHeight, 32]} />
                </mesh>
            </group>

            <Text position={[0, crownHeight + 0.8, 0]} fontSize={0.6} color="#000000" anchorX="center" anchorY="middle">
                {String(number)}
            </Text>

            {Object.entries(conditions || {}).map(([section, data]) => {
                if (!data.condition || !SIDES[section as keyof typeof SIDES]) return null;
                const texture = createToothSymbolTexture(data.condition);
                const side = SIDES[section as keyof typeof SIDES];
                const planeSize = section === 'oclusal' ? crownSize * 2 : Math.max(crownHeight, crownSize * 2);

                return (
                    <mesh key={section} position={side.pos as [number,number,number]} rotation={side.rot as [number,number,number]}>
                        <planeGeometry args={[planeSize * 0.9, planeSize * 0.9]} />
                        <meshStandardMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
                    </mesh>
                );
            })}
        </group>
    );
}

function SceneContent({ onToothClick, onToothHover, toothState, onToothCreated }: any) {
    const teethLayout = useMemo(() => [
        { nums: [18, 17, 16, 15, 14, 13, 12, 11], xStart: -16.5, z: 8, spacing: 2.1 },
        { nums: [21, 22, 23, 24, 25, 26, 27, 28], xStart: 2.1, z: 8, spacing: 2.1 },
        { nums: [55, 54, 53, 52, 51], xStart: -8, z: 3.5, scale: 0.8, spacing: 1.8 },
        { nums: [61, 62, 63, 64, 65], xStart: 2, z: 3.5, scale: 0.8, spacing: 1.8 },
        { nums: [85, 84, 83, 82, 81], xStart: -8, z: -0.5, scale: 0.8, spacing: 1.8 },
        { nums: [71, 72, 73, 74, 75], xStart: 2, z: -0.5, scale: 0.8, spacing: 1.8 },
        { nums: [48, 47, 46, 45, 44, 43, 42, 41], xStart: -16.5, z: -5.5, spacing: 2.1 },
        { nums: [31, 32, 33, 34, 35, 36, 37, 38], xStart: 2.1, z: -5.5, spacing: 2.1 },
    ], []);

    return (
        <group>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 15, 10]} intensity={2.0} />
            <directionalLight position={[-5, 15, -10]} intensity={1.5} />
            
            {teethLayout.flatMap(quadrant =>
                quadrant.nums.map((num, i) => (
                    <Tooth
                        key={num}
                        number={num}
                        position={[quadrant.xStart + i * quadrant.spacing, 0, quadrant.z]}
                        scale={quadrant.scale}
                        conditions={toothState[num]}
                        onClick={onToothClick}
                        onHover={onToothHover}
                        onCreated={(tooth) => onToothCreated(num, tooth)}
                    />
                ))
            )}
        </group>
    );
}

export interface Odontograma3DRef {
  generateDetailedPdf: (patient: Patient, notes: string) => Promise<void>;
  getOdontogramState: () => OdontogramState;
  captureScreenshot: () => Promise<string | undefined>;
}

interface Odontograma3DProps {
    initialState: OdontogramState;
    onStateChange?: (newState: OdontogramState) => void;
    isInteractive?: boolean;
}

const ALL_SECTIONS = ['vestibular', 'lingual', 'mesial', 'distal', 'oclusal'];

const Odontograma3D = forwardRef<Odontograma3DRef, Odontograma3DProps>(({ initialState, onStateChange, isInteractive = true }, ref) => {
    const [toothConditions, setToothConditions] = useState<OdontogramState>(initialState);
    const [selectedSymbol, setSelectedSymbol] = useState<Condition | null>(initialConditions.find(c => c.condition === 'Sano') || null);
    const [selectedSections, setSelectedSections] = useState<string[]>(['oclusal']);
    const [isBorrarActive, setBorrarActive] = useState(false);
    const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
    const [isLegendCollapsed, setLegendCollapsed] = useState(true);
    const [isSectionsCollapsed, setSectionsCollapsed] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>();
    const cameraRef = useRef<THREE.PerspectiveCamera>();
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const toothRefs = useRef<{[key: number]: THREE.Group}>({});

    useEffect(() => { onStateChange?.(toothConditions); }, [toothConditions, onStateChange]);

    const handleSectionToggle = (section: string) => {
        setBorrarActive(false);
        setSelectedSections(prev => 
            prev.includes(section) 
                ? prev.filter(s => s !== section) 
                : [...prev, section]
        );
    };

    const handleSelectAll = () => {
        setBorrarActive(false);
        if (selectedSections.length === ALL_SECTIONS.length) {
            setSelectedSections([]);
        } else {
            setSelectedSections(ALL_SECTIONS);
        }
    };

    const handleToothClick = (toothNumber: number) => {
        if (!isInteractive) return;
        
        setToothConditions(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            if (!newState[toothNumber]) newState[toothNumber] = {};

            if (isBorrarActive) {
                selectedSections.forEach(section => {
                    if (newState[toothNumber][section]) {
                        delete newState[toothNumber][section];
                    }
                });
                if (Object.keys(newState[toothNumber]).length === 0) {
                    delete newState[toothNumber];
                }
            } else if (selectedSymbol && selectedSections.length > 0) {
                 selectedSections.forEach(section => {
                    const isAlreadyApplied = newState[toothNumber][section]?.condition.symbol === selectedSymbol.symbol;
                    if (isAlreadyApplied) {
                        delete newState[toothNumber][section];
                    } else {
                        newState[toothNumber][section] = { condition: selectedSymbol };
                    }
                });
            }
            return newState;
        });
    };
    
    const captureCanvas = () => new Promise<string>((resolve) => {
        setTimeout(() => {
            if (canvasRef.current) {
                resolve(canvasRef.current.toDataURL('image/png'));
            } else {
                resolve('');
            }
        }, 150);
    });

    useImperativeHandle(ref, () => ({
      getOdontogramState: () => toothConditions,
      captureScreenshot: async () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
        return captureCanvas();
      },
      generateDetailedPdf: async (patient: Patient, generalNotes: string) => {
        const teethWithFindings = Object.entries(toothConditions).filter(([_, sections]) =>
            Object.values(sections).some(data => data.condition.condition !== 'Sano')
        ).map(([toothNumber, _]) => parseInt(toothNumber));

        const toothScreenshots: { [key: number]: string } = {};
        if (controlsRef.current && cameraRef.current) {
            const initialCameraPosition = cameraRef.current.position.clone();
            const initialTarget = controlsRef.current.target.clone();

            for (const toothNumber of teethWithFindings) {
                const toothMesh = toothRefs.current[toothNumber];
                if (toothMesh) {
                    const findingsOnTooth = toothConditions[toothNumber];
                    const sectionsWithFindings = Object.keys(findingsOnTooth || {}).filter(
                        section => findingsOnTooth[section]?.condition?.condition !== 'Sano'
                    );

                    const cameraViews = {
                        oclusal:    { pos: new THREE.Vector3(0, 8, 0.1) }, 
                        lingual:    { pos: new THREE.Vector3(0, 2, -8) },  
                        mesial:     { pos: new THREE.Vector3(-6, 2, 6) },
                        distal:     { pos: new THREE.Vector3(6, 2, 6) },
                        vestibular: { pos: new THREE.Vector3(0, 2, 8) }, 
                    };

                    const viewPriority = ['oclusal', 'lingual', 'mesial', 'distal', 'vestibular'];
                    
                    let bestView = 'vestibular';
                    for (const view of viewPriority) {
                        if (sectionsWithFindings.includes(view)) {
                            bestView = view;
                            break;
                        }
                    }

                    const toothPosition = new THREE.Vector3();
                    toothMesh.getWorldPosition(toothPosition);
                    
                    const cameraOffset = cameraViews[bestView as keyof typeof cameraViews].pos;
                    
                    cameraRef.current.position.copy(toothPosition).add(cameraOffset);
                    controlsRef.current.target.copy(toothPosition);
                    controlsRef.current.update();
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                    toothScreenshots[toothNumber] = await captureCanvas();
                }
            }
            
            cameraRef.current.position.copy(initialCameraPosition);
            controlsRef.current.target.copy(initialTarget);
            controlsRef.current.update();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const mainScreenshot = await captureCanvas();
        await generateDetailedOdontogramPDF(patient, toothConditions, generalNotes, mainScreenshot, toothScreenshots);
      },
    }));

    return (
        <div className="w-full h-full relative bg-[#3B82F6]">
            <Canvas
                gl={{ preserveDrawingBuffer: true }}
                camera={{ position: [0, 35, 5], fov: 55 }}
                shadows
                onCreated={({ gl, camera }) => { 
                    canvasRef.current = gl.domElement;
                    cameraRef.current = camera as THREE.PerspectiveCamera;
                }}
            >
                <Suspense fallback={null}>
                    <SceneContent 
                      toothState={toothConditions} 
                      onToothClick={handleToothClick} 
                      onToothHover={setHoveredTooth} 
                      onToothCreated={(num: number, tooth: THREE.Group) => toothRefs.current[num] = tooth}
                    />
                </Suspense>
                <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} enableRotate={true} minDistance={5} maxDistance={60} />
                <Environment preset="studio" />
            </Canvas>

            {isInteractive && (
                <div className="absolute inset-0 pointer-events-none">
                    <Panel title="ODONTOGRAMA 3D" position="top-3 left-3" isCollapsed={false} onToggle={() => {}}>
                         <p>Sección: <strong className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{isBorrarActive ? <span className="text-red-500">BORRAR</span> : selectedSections.join(', ') || 'Ninguna'}</strong></p>
                         <p>Símbolo: <strong className="font-semibold text-blue-600 dark:text-blue-400">{selectedSymbol?.condition || 'Ninguno'}</strong></p>
                         <p>Diente: <strong className="font-semibold text-blue-600 dark:text-blue-400">{hoveredTooth || 'Ninguno'}</strong></p>
                    </Panel>

                    <Panel title="SECCIONES (MÚLTIPLE)" position="bottom-3 left-3" isCollapsed={isSectionsCollapsed} onToggle={() => setSectionsCollapsed(v => !v)}>
                        <div className="flex flex-col gap-2">
                            <button onClick={handleSelectAll} className={cn(
                                "pointer-events-auto w-full text-left p-2 text-sm rounded-md transition-colors mb-2 font-semibold",
                                selectedSections.length === ALL_SECTIONS.length ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                            )}>
                                Seleccionar Todas
                            </button>
                            {ALL_SECTIONS.map(s => (
                                <button key={s} onClick={() => handleSectionToggle(s)} className={cn(
                                    "pointer-events-auto w-full text-left p-2 text-sm rounded-md transition-colors",
                                    selectedSections.includes(s) ? 'bg-blue-500 text-white shadow-md' : 'bg-white/80 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-blue-800'
                                )}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                             <button onClick={() => { setBorrarActive(true); setSelectedSections([]); }} className={cn(
                                "pointer-events-auto w-full text-left p-2 text-sm rounded-md transition-colors mt-2",
                                isBorrarActive ? 'bg-red-500 text-white shadow-md' : 'bg-red-300/80 hover:bg-red-400 dark:bg-red-800/80 dark:hover:bg-red-700'
                            )}>
                                Borrar Condición (Selecciona caras y diente)
                            </button>
                        </div>
                    </Panel>

                    <Panel title="LEYENDA" position="top-3 right-3" isCollapsed={isLegendCollapsed} onToggle={() => setLegendCollapsed(v => !v)}>
                        <div className="grid grid-cols-2 gap-2">
                            {initialConditions.map((cond, index) => (
                                <div key={`${cond.condition}-${index}`} onClick={() => { setSelectedSymbol(cond); setBorrarActive(false); }}
                                    className={cn(
                                        `pointer-events-auto p-2 rounded-lg cursor-pointer border-2 flex items-center gap-2 transition-colors`,
                                        !isBorrarActive && selectedSymbol?.symbol === cond.symbol ? 'border-blue-500 bg-blue-100/80' : 'border-transparent hover:bg-gray-200/80 dark:hover:bg-gray-600/80'
                                    )}>
                                    <span style={{ color: cond.color }} className="font-bold text-lg w-5 text-center">{cond.symbol}</span>
                                    <span className="text-xs text-gray-700 dark:text-gray-300">{cond.condition}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            )}
        </div>
    );
});

Odontograma3D.displayName = 'Odontograma3D';
export default Odontograma3D;

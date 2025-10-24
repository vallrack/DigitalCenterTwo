
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// Memoized Legend Component for performance
const Legend = React.memo(({ conditions, onSelectSymbol, onToggle, isMinimized }) => (
    <div id="legend" className={`odontogram-ui ${isMinimized ? 'minimized' : ''}`}>
        <div id="legend-header" onClick={() => onToggle(!isMinimized)}>
            <h3>LEYENDA</h3>
            <button id="toggle-btn" title="Minimizar/Maximizar" onClick={(e) => { e.stopPropagation(); onToggle(!isMinimized); }}>
                {isMinimized ? '+' : '−'}
            </button>
        </div>
        <div className="legend-content">
            <div className="legend-grid">
                {conditions.map((cond, index) => (
                    <div
                        key={index}
                        className="legend-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectSymbol(cond);
                            document.querySelectorAll('.legend-item').forEach(i => i.classList.remove('selected'));
                            (e.currentTarget as HTMLDivElement).classList.add('selected');
                        }}
                    >
                        <div className="symbol" style={{ color: cond.color }}>{cond.symbol}</div>
                        <div className="condition">{cond.condition}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
));
Legend.displayName = 'Legend';

const Odontograma3D = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(new THREE.PerspectiveCamera(75, 1, 0.1, 1000));
    const teethRef = useRef<THREE.Group[]>([]);
    const toothConditionsRef = useRef<{ [key: number]: { [key: string]: THREE.Sprite } }>({});
    
    const isDraggingRef = useRef(false);
    const prevMouseRef = useRef({ x: 0, y: 0 });

    const [selectedSymbol, setSelectedSymbol] = useState<any>(null);
    const [selectedSection, setSelectedSection] = useState('vestibular');
    const [selectedToothInfo, setSelectedToothInfo] = useState('Ninguno');
    const [legendMinimized, setLegendMinimized] = useState(false);

    // Use refs to hold current state for use in event listeners without re-binding
    const selectedSymbolRef = useRef(selectedSymbol);
    useEffect(() => { selectedSymbolRef.current = selectedSymbol; }, [selectedSymbol]);

    const selectedSectionRef = useRef(selectedSection);
    useEffect(() => { selectedSectionRef.current = selectedSection; }, [selectedSection]);

    const conditions = [
        { symbol: 'S', condition: 'Sano', color: 'black', type: 'text' },
        { symbol: '+', condition: 'Caries', color: '#e74c3c', type: 'text' },
        { symbol: '●', condition: 'Obturación adaptada', color: '#3498db', type: 'circle' },
        { symbol: '●', condition: 'Obturación desadaptada', color: '#e74c3c', type: 'circle' },
        { symbol: 'X', condition: 'Exodoncia indicada', color: '#e74c3c', type: 'text' },
        { symbol: '△', condition: 'Endodoncia realizada', color: '#3498db', type: 'triangle' },
        { symbol: '△', condition: 'Endodoncia indicada', color: '#e74c3c', type: 'triangle' },
        { symbol: 'S', condition: 'Sellante buen estado', color: '#3498db', type: 'text' },
        { symbol: 'S', condition: 'Sellante mal estado', color: '#e74c3c', type: 'text' },
        { symbol: 'O', condition: 'Corona buen estado', color: '#3498db', type: 'text' },
        { symbol: 'O', condition: 'Corona mal estado', color: '#e74c3c', type: 'text' },
        { symbol: '—', condition: 'Diente sin erupcionar', color: '#3498db', type: 'line' },
        { symbol: '|', condition: 'Diente ausente', color: '#3498db', type: 'line' },
        { symbol: 'FX', condition: 'Fractura dental', color: '#e74c3c', type: 'text' },
    ];

    const handleSymbolSelect = useCallback((symbol) => setSelectedSymbol(symbol), []);
    const handleSectionChange = (section: string) => {
        document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.section-btn[data-section="${section}"]`)?.classList.add('active');
        setSelectedSection(section);
    };
    
    const createToothSymbol = (condition: any, section: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = condition.color;
        ctx.strokeStyle = condition.color;
        ctx.lineWidth = 8;
        ctx.font = 'bold 70px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        switch (condition.type) {
            case 'text': ctx.fillText(condition.symbol, 64, 70); break;
            case 'circle': ctx.beginPath(); ctx.arc(64, 64, 30, 0, 2 * Math.PI); ctx.fill(); break;
            case 'triangle': ctx.beginPath(); ctx.moveTo(64, 25); ctx.lineTo(100, 85); ctx.lineTo(28, 85); ctx.closePath(); ctx.stroke(); break;
            case 'line': ctx.beginPath(); ctx.moveTo(20, 64); ctx.lineTo(108, 64); ctx.stroke(); break;
        }

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.5, 0.5, 1);
        sprite.renderOrder = 999;

        switch(section) {
            case 'vestibular': sprite.position.set(0, 0.3, 0.55); break;
            case 'lingual': sprite.position.set(0, 0.3, -0.55); break;
            case 'mesial': sprite.position.set(-0.55, 0.3, 0); break;
            case 'distal': sprite.position.set(0.55, 0.3, 0); break;
            case 'oclusal': sprite.position.set(0, 0.8, 0); sprite.scale.set(0.4, 0.4, 1); break;
        }
        return sprite;
    };

    // Main useEffect for setup, runs only once
    useEffect(() => {
        if (!mountRef.current) return;
        const mount = mountRef.current;

        const scene = sceneRef.current;
        scene.background = new THREE.Color(0x1a1a2e);

        const camera = cameraRef.current;
        camera.position.set(0, 8, 22); // Adjusted initial zoom
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;
        mount.appendChild(renderer.domElement);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(10, 15, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const createTooth = (number, position, scale = 1) => {
            const group = new THREE.Group();
            const material = new THREE.MeshPhongMaterial({ color: 0xf0e6d6, shininess: 40 });
            const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 0.8, 10), material);
            crown.position.y = 0.4; crown.castShadow = true; group.add(crown);
            const root = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.1, 0.7, 8), material);
            root.position.y = -0.35; group.add(root);

            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 128;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#2dff2d'; ctx.font = 'bold 50px Arial'; ctx.textAlign = 'center';
            ctx.fillText(String(number), 64, 60);
            const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
            label.position.y = 1.2; label.scale.set(0.9, 0.9, 1); group.add(label);

            group.position.set(position.x, position.y, position.z);
            group.scale.set(scale, scale, scale);
            group.userData = { number, type: 'tooth' };
            return group;
        };
        
        if (teethRef.current.length === 0) {
            const teethData = [
                { nums: [18, 17, 16, 15, 14, 13, 12, 11], xStart: -7, z: 3, scale: 1 },
                { nums: [21, 22, 23, 24, 25, 26, 27, 28], xStart: 0.5, z: 3, scale: 1 },
                { nums: [48, 47, 46, 45, 44, 43, 42, 41], xStart: -7, z: -3, scale: 1 },
                { nums: [31, 32, 33, 34, 35, 36, 37, 38], xStart: 0.5, z: -3, scale: 1 },
                { nums: [55, 54, 53, 52, 51], xStart: -4, z: 0, scale: 0.8 },
                { nums: [61, 62, 63, 64, 65], xStart: 0.5, z: 0, scale: 0.8 },
                { nums: [85, 84, 83, 82, 81], xStart: -4, z: -6, scale: 0.8 },
                { nums: [71, 72, 73, 74, 75], xStart: 0.5, z: -6, scale: 0.8 }
            ];
            const spacing = 1.2;
            teethData.forEach(data => {
                data.nums.forEach((num, i) => {
                    const tooth = createTooth(num, { x: data.xStart * spacing + i * spacing, y: 0, z: data.z }, data.scale);
                    teethRef.current.push(tooth);
                    scene.add(tooth);
                });
            });
        }

        const getMousePos = (e, target) => {
            const rect = target.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }

        const onMouseDown = (e) => { isDraggingRef.current = true; prevMouseRef.current = { x: e.clientX, y: e.clientY }; };
        const onMouseUp = () => { isDraggingRef.current = false; };
        const onMouseMove = (e) => {
            if (!isDraggingRef.current) return;
            const deltaX = e.clientX - prevMouseRef.current.x;
            const deltaY = e.clientY - prevMouseRef.current.y;
            scene.rotation.y += deltaX * 0.005;
            scene.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, scene.rotation.x + deltaY * 0.005));
            prevMouseRef.current = { x: e.clientX, y: e.clientY };
        };
        const onWheel = (e) => {
            camera.position.z += e.deltaY * 0.01;
            camera.position.z = Math.max(5, Math.min(40, camera.position.z));
        };
        const onClick = (e) => {
            const currentSymbol = selectedSymbolRef.current;
            const currentSection = selectedSectionRef.current;

            const pos = getMousePos(e, e.currentTarget);
            mouse.x = (pos.x / mount.clientWidth) * 2 - 1;
            mouse.y = -(pos.y / mount.clientHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(teethRef.current, true);
            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while (obj.parent && !obj.userData.type) { obj = obj.parent; }
                const toothNumber = obj.userData.number;
                if (!toothConditionsRef.current[toothNumber]) toothConditionsRef.current[toothNumber] = {};
                
                if (currentSection === 'borrar') {
                    Object.values(toothConditionsRef.current[toothNumber] || {}).forEach(sprite => obj.remove(sprite));
                    delete toothConditionsRef.current[toothNumber];
                    setSelectedToothInfo(`Diente: ${toothNumber} - Marcas eliminadas`);
                } else if (currentSymbol) {
                    if (toothConditionsRef.current[toothNumber]?.[currentSection]) {
                        obj.remove(toothConditionsRef.current[toothNumber][currentSection]);
                    }
                    const symbolSprite = createToothSymbol(currentSymbol, currentSection);
                    obj.add(symbolSprite);
                    toothConditionsRef.current[toothNumber][currentSection] = symbolSprite;
                    setSelectedToothInfo(`Diente: ${toothNumber} - ${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}`);
                }
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            if (!mount) return;
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        });
        resizeObserver.observe(mount);

        mount.addEventListener('mousedown', onMouseDown);
        mount.addEventListener('mouseup', onMouseUp);
        mount.addEventListener('mouseleave', onMouseUp);
        mount.addEventListener('mousemove', onMouseMove);
        mount.addEventListener('wheel', onWheel, { passive: true });
        mount.addEventListener('click', onClick);

        const animate = () => {
            if (!rendererRef.current) return;
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            resizeObserver.disconnect();
            mount.removeEventListener('mousedown', onMouseDown);
            mount.removeEventListener('mouseup', onMouseUp);
            mount.removeEventListener('mouseleave', onMouseUp);
            mount.removeEventListener('mousemove', onMouseMove);
            mount.removeEventListener('wheel', onWheel);
            mount.removeEventListener('click', onClick);
            if (renderer.domElement.parentElement === mount) {
                mount.removeChild(renderer.domElement);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs only once

    return (
        <>
            <style jsx global>{`
                .odontogram-container { position: relative; width: 100%; height: 100%; cursor: grab; }
                .odontogram-container:active { cursor: grabbing; }
                .odontogram-ui { position: absolute; z-index: 10; background: rgba(20, 20, 30, 0.8); backdrop-filter: blur(5px); padding: 12px; border-radius: 8px; color: #f0f0f0; pointer-events: auto; user-select: none; }
                
                #info.odontogram-ui { top: 15px; left: 15px; font-size: 14px; max-width: 260px; }
                #info h2 { margin: 0 0 12px; font-size: 18px; color: #f39c12; }

                #section-selector.odontogram-ui { top: 220px; left: 15px; display: flex; flex-direction: column; gap: 6px; }
                .section-btn { padding: 10px 15px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 5px; cursor: pointer; transition: all 0.2s; text-align: left; }
                .section-btn:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.4); }
                .section-btn.active { background: #27ae60; border-color: #2ecc71; font-weight: bold; }
                .section-btn[data-section="borrar"] { background-color: #c0392b; border-color: #e74c3c; }
                
                #legend.odontogram-ui { top: 15px; right: 15px; background: rgba(255,255,255,0.95); max-width: 400px; max-height: calc(100% - 30px); display: flex; flex-direction: column; padding: 0; color: #333; }
                #legend.minimized .legend-content { display: none; }
                #legend-header { display: flex; justify-content: space-between; align-items: center; background: #f39c12; padding: 10px 15px; cursor: pointer; color: #fff; border-radius: 8px 8px 0 0; }
                #legend.minimized #legend-header { border-radius: 8px; }
                #legend-header h3 { font-size: 16px; margin: 0; }
                #toggle-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #fff; }
                .legend-content { padding: 15px; overflow-y: auto; }
                .legend-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .legend-item { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 5px; cursor: pointer; transition: background 0.2s; border: 1px solid transparent; }
                .legend-item:hover { background: #f0f0f0; }
                .legend-item.selected { background: #e8f8f5; border-color: #27ae60; }
                .symbol { width: 30px; text-align: center; font-weight: bold; font-size: 18px; }
                .condition { font-size: 12px; }
            `}</style>
            
            <div ref={mountRef} className="odontogram-container">
                {/* Canvas is appended by useEffect */}
                
                <div id="info" className="odontogram-ui">
                    <h2>Odontograma 3D</h2>
                    <p>🖱️ Arrastra para rotar</p>
                    <p>🔍 Rueda para zoom</p>
                    <p>Sección: <strong>{selectedSection === 'borrar' ? <span style={{color: '#e74c3c'}}>BORRAR</span> : selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}</strong></p>
                    <p>Símbolo: <strong>{selectedSymbol?.condition || 'Ninguno'}</strong></p>
                    <p>Diente: <strong dangerouslySetInnerHTML={{__html: selectedToothInfo}}></strong></p>
                </div>

                <div id="section-selector" className="odontogram-ui">
                    <button className="section-btn active" data-section="vestibular" onClick={() => handleSectionChange('vestibular')}>📍 Vestibular</button>
                    <button className="section-btn" data-section="lingual" onClick={() => handleSectionChange('lingual')}>📍 Lingual</button>
                    <button className="section-btn" data-section="mesial" onClick={() => handleSectionChange('mesial')}>📍 Mesial</button>
                    <button className="section-btn" data-section="distal" onClick={() => handleSectionChange('distal')}>📍 Distal</button>
                    <button className="section-btn" data-section="oclusal" onClick={() => handleSectionChange('oclusal')}>📍 Oclusal</button>
                    <button className="section-btn" data-section="borrar" onClick={() => handleSectionChange('borrar')}>🗑️ Borrar</button>
                </div>

                <Legend conditions={conditions} onSelectSymbol={handleSymbolSelect} onToggle={setLegendMinimized} isMinimized={legendMinimized} />
            </div>
        </>
    );
};

export default Odontograma3D;

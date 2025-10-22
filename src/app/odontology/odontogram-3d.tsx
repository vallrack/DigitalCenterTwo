'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ... [interface and conditions array remain the same] ...
interface ToothCondition {
  symbol: string;
  condition: string;
  color: string;
  type: string;
}

const conditions: ToothCondition[] = [
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
  { symbol: '⌒', condition: 'Obturación cervical desadaptada', color: '#e74c3c', type: 'arc' },
  { symbol: '⌒', condition: 'Obturación cervical adaptada', color: '#3498db', type: 'arc' },
  { symbol: 'FX', condition: 'Fractura dental', color: '#e74c3c', type: 'text' },
  { symbol: 'CT', condition: 'Cemento temporal', color: '#e74c3c', type: 'text' },
  { symbol: 'O(P)', condition: 'Provisional mal estado', color: '#e74c3c', type: 'text' },
  { symbol: 'O(P)', condition: 'Provisional buen estado', color: '#3498db', type: 'text' },
  { symbol: '⊙', condition: 'Resina/Ionómero', color: '#27ae60', type: 'circle-dot' },
  { symbol: '◆', condition: 'Perno/Muñón', color: '#3498db', type: 'diamond' },
];

const Odontograma3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<ToothCondition | null>(null);
  const [selectedTooth, setSelectedTooth] = useState<string>('Ninguno');
  const [isLegendMinimized, setIsLegendMinimized] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const odontogramGroupRef = useRef<THREE.Group>(new THREE.Group()); // Use a group for rotation
  const toothConditionsRef = useRef<{ [key: number]: THREE.Sprite }>({});
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const lastClickTimeRef = useRef(0);

  // ... [useEffect for scene setup remains largely the same, but adds odontogramGroupRef] ...
  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    scene.add(odontogramGroupRef.current);

    createOdontogram(odontogramGroupRef.current);

    const animate = () => {
      if (!renderer || !scene || !camera) return;
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!currentMount || !camera || !renderer) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  const createToothSymbol = (condition: ToothCondition): THREE.Sprite => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = condition.color;
    ctx.strokeStyle = condition.color;
    ctx.lineWidth = 12;
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (condition.type) {
      case 'text':
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.strokeText(condition.symbol, 128, 128);
        ctx.fillStyle = condition.color;
        ctx.fillText(condition.symbol, 128, 128);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(128, 128, 60, 0, Math.PI * 2);
        ctx.lineWidth = 15;
        ctx.fillStyle = condition.color;
        ctx.fill();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(128, 50);
        ctx.lineTo(190, 170);
        ctx.lineTo(66, 170);
        ctx.closePath();
        ctx.lineWidth = 15;
        ctx.strokeStyle = condition.color;
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(30, 128);
        ctx.lineTo(226, 128);
        ctx.lineWidth = 15;
        ctx.strokeStyle = condition.color;
        ctx.stroke();
        break;
      case 'arc':
        ctx.beginPath();
        ctx.arc(128, 190, 70, Math.PI, 0, false);
        ctx.lineWidth = 15;
        ctx.strokeStyle = condition.color;
        ctx.stroke();
        break;
      case 'circle-dot':
        ctx.beginPath();
        ctx.arc(128, 128, 60, 0, Math.PI * 2);
        ctx.lineWidth = 15;
        ctx.strokeStyle = condition.color;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(128, 128, 20, 0, Math.PI * 2);
        ctx.fillStyle = condition.color;
        ctx.fill();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(128, 50);
        ctx.lineTo(190, 128);
        ctx.lineTo(128, 206);
        ctx.lineTo(66, 128);
        ctx.closePath();
        ctx.fillStyle = condition.color;
        ctx.fill();
        break;
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.5, 1.5, 1);
    sprite.position.y = 0.3;
    sprite.renderOrder = 999;

    return sprite;
  };

  const createTooth = (number: number, position: { x: number; y: number; z: number }): THREE.Group => {
    const group = new THREE.Group();
    const crownGeometry = new THREE.CylinderGeometry(0.4, 0.35, 0.8, 8);
    const crownMaterial = new THREE.MeshPhongMaterial({ color: 0xf5f5dc, shininess: 30, specular: 0x444444 });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 0.4;
    crown.castShadow = true;
    crown.receiveShadow = true;
    group.add(crown);
    const rootGeometry = new THREE.CylinderGeometry(0.25, 0.15, 0.6, 8);
    const rootMaterial = new THREE.MeshPhongMaterial({ color: 0xe8d4b0, shininess: 20 });
    const root = new THREE.Mesh(rootGeometry, rootMaterial);
    root.position.y = -0.3;
    root.castShadow = true;
    group.add(root);
    const circleGeometry = new THREE.TorusGeometry(0.5, 0.05, 16, 32);
    const circleMaterial = new THREE.MeshPhongMaterial({ color: 0x666666, shininess: 50 });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.x = Math.PI / 2;
    circle.position.y = -0.6;
    group.add(circle);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, 30, 88, 68);
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(number.toString(), 64, 64);
    ctx.fillText(number.toString(), 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.SpriteMaterial({ map: texture });
    const label = new THREE.Sprite(labelMaterial);
    label.position.y = 1.2;
    label.scale.set(0.8, 0.8, 1);
    group.add(label);
    group.position.set(position.x, position.y, position.z);
    group.userData = { number, type: 'tooth' };
    return group;
  };

  const createOdontogram = (group: THREE.Group) => {
    const spacing = 1.2;
    const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
    const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
    const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
    const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];
    const upperRightExtra = [55, 54, 53, 52, 51];
    const upperLeftExtra = [61, 62, 63, 64, 65];
    const lowerRightExtra = [85, 84, 83, 82, 81];
    const lowerLeftExtra = [71, 72, 73, 74, 75];

    upperRight.forEach((num, i) => group.add(createTooth(num, { x: -7 * spacing + i * spacing, y: 0, z: 3 })));
    upperLeft.forEach((num, i) => group.add(createTooth(num, { x: 0.5 * spacing + i * spacing, y: 0, z: 3 })));
    lowerRight.forEach((num, i) => group.add(createTooth(num, { x: -7 * spacing + i * spacing, y: 0, z: -3 })));
    lowerLeft.forEach((num, i) => group.add(createTooth(num, { x: 0.5 * spacing + i * spacing, y: 0, z: -3 })));
    
    upperRightExtra.forEach((num, i) => {
        const tooth = createTooth(num, { x: -4 * spacing + i * spacing, y: 0, z: 0 });
        tooth.scale.set(0.8, 0.8, 0.8);
        group.add(tooth);
    });
    upperLeftExtra.forEach((num, i) => {
        const tooth = createTooth(num, { x: 0.5 * spacing + i * spacing, y: 0, z: 0 });
        tooth.scale.set(0.8, 0.8, 0.8);
        group.add(tooth);
    });
    lowerRightExtra.forEach((num, i) => {
        const tooth = createTooth(num, { x: -4 * spacing + i * spacing, y: 0, z: -6 });
        tooth.scale.set(0.8, 0.8, 0.8);
        group.add(tooth);
    });
    lowerLeftExtra.forEach((num, i) => {
        const tooth = createTooth(num, { x: 0.5 * spacing + i * spacing, y: 0, z: -6 });
        tooth.scale.set(0.8, 0.8, 0.8);
        group.add(tooth);
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = false; // It's a drag only if the mouse moves
    lastClickTimeRef.current = Date.now();
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
    if (mountRef.current) mountRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return; // Ensure left mouse button is pressed
    isDraggingRef.current = true;
    if (mountRef.current) mountRef.current.style.cursor = 'grabbing';

    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    const rotationSpeed = 0.005;

    // Create quaternions for rotation around world axes
    const quatY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * rotationSpeed);
    const quatX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * rotationSpeed);

    // Combine rotations: apply Y rotation first, then X rotation
    const group = odontogramGroupRef.current;
    group.quaternion.multiplyQuaternions(quatY, group.quaternion);
    group.quaternion.multiplyQuaternions(quatX, group.quaternion);

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mountRef.current) mountRef.current.style.cursor = 'grab';
    // Check if it was a click (not a drag)
    if (!isDraggingRef.current) {
        handleCanvasClick(e);
    }
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!selectedSymbol || !mountRef.current || !cameraRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(odontogramGroupRef.current.children, true);

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && obj.parent && !obj.userData.type) {
        obj = obj.parent;
      }

      if (obj && obj.userData.type === 'tooth') {
        const toothNumber = obj.userData.number;
        if (toothConditionsRef.current[toothNumber]) {
          obj.remove(toothConditionsRef.current[toothNumber]);
        }
        const symbolSprite = createToothSymbol(selectedSymbol);
        obj.add(symbolSprite);
        toothConditionsRef.current[toothNumber] = symbolSprite;
        setSelectedTooth(`${toothNumber} - ${selectedSymbol.condition}`);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    e.preventDefault();

    const zoomSpeed = 0.01;
    const minZoom = 10;
    const maxZoom = 40;

    // Move camera along its local Z axis
    cameraRef.current.translateZ(e.deltaY * zoomSpeed);
    // Clamp the camera's distance from the origin
    cameraRef.current.position.setLength(Math.max(minZoom, Math.min(maxZoom, cameraRef.current.position.length())));
    cameraRef.current.lookAt(0,0,0); // Ensure camera always looks at the center

  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
       <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'white',
          background: 'rgba(0,0,0,0.8)',
          padding: '15px',
          borderRadius: '10px',
          fontSize: '13px',
          maxWidth: '280px',
          pointerEvents: 'auto',
        }}
      >
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Odontograma 3D</h2>
        <p>🖱️ Arrastra para rotar</p>
        <p>🔍 Rueda para zoom</p>
        <p>1️⃣ Selecciona un símbolo</p>
        <p>2️⃣ Click en un diente</p>
        <p>
          Símbolo: <strong>{selectedSymbol ? selectedSymbol.condition : 'Ninguno'}</strong>
        </p>
        <p>
          Diente: <strong>{selectedTooth}</strong>
        </p>
      </div>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.95)',
          padding: 0,
          borderRadius: '10px',
          maxWidth: '800px',
          maxHeight: '90vh',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          pointerEvents: 'auto',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f39c12',
            padding: '10px 15px',
            borderRadius: isLegendMinimized ? '10px' : '10px 10px 0 0',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => setIsLegendMinimized(!isLegendMinimized)}
        >
          <h3 style={{ margin: 0, color: '#333', fontSize: '16px', flexGrow: 1 }}>
            LEYENDA DE CONDICIONES DENTALES
          </h3>
          <button
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: 'none',
              color: '#333',
              fontSize: '20px',
              fontWeight: 'bold',
              width: '30px',
              height: '30px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Minimizar/Maximizar"
          >
            {isLegendMinimized ? '+' : '−'}
          </button>
        </div>

        {!isLegendMinimized && (
          <div style={{ padding: '15px', maxHeight: 'calc(90vh - 60px)', overflowY: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
              }}
            >
              {conditions.map((cond, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    border: selectedIndex === index ? '2px solid #27ae60' : '2px solid transparent',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: selectedIndex === index ? '#e8f8f5' : 'white',
                  }}
                  onClick={() => {
                    setSelectedSymbol(cond);
                    setSelectedIndex(index);
                  }}
                  onMouseEnter={(e) => {
                    if (selectedIndex !== index) {
                      e.currentTarget.style.background = '#f0f0f0';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedIndex !== index) {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      flexShrink: 0,
                      color: cond.color,
                    }}
                  >
                    {cond.symbol}
                  </div>
                  <div style={{ fontSize: '11px', color: '#333', flexGrow: 1 }}>
                    {cond.condition}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          padding: '15px',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center',
          pointerEvents: 'auto',
        }}
      >
        <p style={{ margin: 0 }}>Sistema de numeración dental FDI</p>
      </div>
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves canvas
        onWheel={handleWheel}
      />
    </div>
  );
};

export default Odontograma3D;
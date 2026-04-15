// 마인크래프트 3D 게임
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 하늘색
scene.fog = new THREE.Fog(0x87ceeb, 100, 1000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

camera.position.set(0, 20, 30);
camera.lookAt(0, 0, 0);

// 조명
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.far = 200;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// 블록 텍스처
const textureLoader = new THREE.TextureLoader();
const blockTextures = {
    grass: new THREE.Color(0x00aa00),
    dirt: new THREE.Color(0x8b7355),
    stone: new THREE.Color(0x808080),
    wood: new THREE.Color(0xb8860b)
};

// 플레이어 움직임
const keys = {};
const playerSpeed = 0.5;
const playerJumpForce = 20;
let playerVelocityY = 0;
let isJumping = false;
const gravity = 0.8;

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// 마우스 컨트롤
let eulerOrder = 'YXZ';
const euler = new THREE.Euler(0, 0, 0, eulerOrder);
const vector = new THREE.Vector3();

function onMouseMove(event) {
    euler.setFromQuaternion(camera.quaternion);
    euler.rotateY(-event.movementX * 0.01);
    euler.rotateX(-event.movementY * 0.01);
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
    camera.quaternion.setFromEuler(euler);
}

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('click', () => {
    document.requestPointerLock = document.requestPointerLock || document.mozRequestPointerLock;
    document.requestPointerLock();
});

// 블록 저장소
const blocks = new Map();
const CHUNK_SIZE = 16;

function getBlockKey(x, y, z) {
    return `${x},${y},${z}`;
}

function createBlock(x, y, z, type = 'dirt') {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
        color: blockTextures[type],
        roughness: 0.7,
        metalness: 0.1
    });
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x + 0.5, y + 0.5, z + 0.5);
    block.castShadow = true;
    block.receiveShadow = true;
    block.userData = { type, x, y, z };
    
    scene.add(block);
    blocks.set(getBlockKey(x, y, z), block);
    return block;
}

// 초기 지형 생성
function generateTerrain() {
    for (let x = -20; x < 20; x++) {
        for (let z = -20; z < 20; z++) {
            // 지면
            createBlock(x, 0, z, 'grass');
            // 아래층
            if (Math.random() > 0.3) {
                createBlock(x, -1, z, 'dirt');
            }
            // 랜덤 높이의 나무
            if (Math.random() > 0.95) {
                for (let h = 1; h < 5; h++) {
                    createBlock(x, h, z, 'wood');
                }
            }
        }
    }
}

generateTerrain();

// 선택된 블록 타입
let selectedBlock = 'dirt';
document.querySelectorAll('.hotbar-slot').forEach(slot => {
    slot.addEventListener('click', () => {
        document.querySelectorAll('.hotbar-slot').forEach(s => s.classList.remove('active'));
        slot.classList.add('active');
        selectedBlock = slot.dataset.block;
    });
});

// 레이캐스팅으로 블록 배치/제거
const raycaster = new THREE.Raycaster();
const centerScreen = new THREE.Vector2(0, 0);

function getTargetBlock() {
    raycaster.setFromCamera(centerScreen, camera);
    
    const blockMeshes = Array.from(blocks.values());
    const intersects = raycaster.intersectObjects(blockMeshes);
    
    if (intersects.length > 0) {
        return intersects[0];
    }
    return null;
}

// 마우스 클릭 이벤트
document.addEventListener('click', () => {
    const target = getTargetBlock();
    if (!target) return;

    const block = target.object;
    const { x, y, z } = block.userData;

    if (event.button === 0) { // 좌클릭 - 블록 제거
        scene.remove(block);
        blocks.delete(getBlockKey(x, y, z));
    }
});

// 우클릭 - 블록 배치
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const target = getTargetBlock();
    if (!target) return;

    const block = target.object;
    const { x, y, z } = block.userData;
    
    const normal = target.face.normal;
    const newX = x + normal.x;
    const newY = y + normal.y;
    const newZ = z + normal.z;

    if (!blocks.has(getBlockKey(newX, newY, newZ))) {
        createBlock(newX, newY, newZ, selectedBlock);
    }
});

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);

    // 플레이어 이동
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward);

    if (keys['w'] || keys['W']) camera.position.addScaledVector(forward, playerSpeed);
    if (keys['s'] || keys['S']) camera.position.addScaledVector(forward, -playerSpeed);
    if (keys['a'] || keys['A']) camera.position.addScaledVector(right, -playerSpeed);
    if (keys['d'] || keys['D']) camera.position.addScaledVector(right, playerSpeed);

    // 점프
    if ((keys[' '] || keys['Space']) && !isJumping) {
        playerVelocityY = playerJumpForce;
        isJumping = true;
    }

    // 중력
    playerVelocityY -= gravity;
    camera.position.y += playerVelocityY;

    // 지면 충돌
    if (camera.position.y <= 2) {
        camera.position.y = 2;
        playerVelocityY = 0;
        isJumping = false;
    }

    renderer.render(scene, camera);
}

animate();

// 창 크기 조정
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
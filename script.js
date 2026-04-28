// Three.js를 이용한 3D 렌더링
let scene, camera, renderer, cube, sphere;
let mouseX = 0;
let mouseY = 0;

// 초기화
function init() {
    // 캔버스 요소
    const canvas = document.getElementById('canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // 씬 생성
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // 카메라 설정
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    // 렌더러 설정
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // 정육면체 생성
    const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = -2;
    scene.add(cube);
    
    // 구 생성
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = 2;
    scene.add(sphere);
    
    // 이벤트 리스너
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
    
    // 애니메이션 루프 시작
    animate();
}

// 마우스 움직임 감지
function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// 윈도우 크기 변경
function onWindowResize() {
    const canvas = document.getElementById('canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// 애니메이션
function animate() {
    requestAnimationFrame(animate);
    
    // 정육면체 회전
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.01;
    
    // 구 회전
    sphere.rotation.x += 0.008;
    sphere.rotation.y += 0.005;
    
    // 마우스 위치에 따라 카메라 움직임
    camera.position.x = mouseX * 2;
    camera.position.y = mouseY * 2;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// 페이지 로드 완료 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
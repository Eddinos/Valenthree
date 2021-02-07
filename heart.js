function init () {
  const { scene, camera, renderer } = useScene()
  const { vertices, trianglesIndexes } = useCoordinates()
  const { geo, heartMesh } = createHeartMesh(vertices, trianglesIndexes)
  addWireFrameToMesh(heartMesh, geo)
  heartMesh.position.y = -5
  scene.add(heartMesh)
  createRoom({ width: 70, height: 70, depth: 70 }, scene)

  const modal = document.querySelector('.message')
  const { onMouseIntersection } = handleMouseIntersection(camera, scene, modal, heartMesh.uuid)

  const animate = function () {
    requestAnimationFrame( animate );    
        
    renderer.render( scene, camera );
    heartMesh.rotation.y -= 0.005
    
    startAnim && beatingAnimation(heartMesh, () => openModal(modal))
  };

  window.addEventListener( 'click', onMouseIntersection, false )
  window.addEventListener( 'touchend', onMouseIntersection, false )
  
  modal.addEventListener('click', () => closeModal(modal))
  modal.addEventListener('touchend', () => closeModal(modal))

  animate()
}

let startAnim = false
let scaleThreshold = false

const beatingIncrement = 0.008


function useScene () {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.z = 30;
  camera.position.y = 0;

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls = new DeviceOrientationControls( camera );
  // controls.minPolarAngle = Math.PI/3
  // controls.maxPolarAngle = 2*Math.PI/3
  // // controls.maxAzimuthAngle = Math.PI/3
  // // controls.minAzimuthAngle = -Math.PI/3
  // controls.minDistance = 20
  // controls.maxDistance = 34
  // // controls.target.set(0, 5, 0);
  // controls.update();

  const color = 0xFFFFFF;
  const intensity = 0.75;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-15, -10, -30);
  light2 = new THREE.PointLight(color, intensity);
  light2.position.set(15, -10, 30);
  
  scene.add(light);
  scene.add(light2)

  return {
    scene,
    camera,
    renderer,
    controls,
    // light
  }
}

function useCoordinates () {
  const vertices = [
    new THREE.Vector3(0, 0, 0), // 0
    new THREE.Vector3(0, 5, -1.5), // 1
    new THREE.Vector3(5, 5, 0), // 2
    
      new THREE.Vector3(9, 9, 0), // 3
    new THREE.Vector3(5, 9, 2), // 4
    
      new THREE.Vector3(7, 13, 0), // 5
    
    new THREE.Vector3(3, 13, 0), // 6
    new THREE.Vector3(0, 11, 0), // 7
    
    new THREE.Vector3(5, 9, -2), // 8
    
    
    new THREE.Vector3(0, 8, -3), // 9
    new THREE.Vector3(0, 8, 3), // 10
    new THREE.Vector3(0, 5, 1.5), // 11
    new THREE.Vector3(-9, 9, 0), // 12
    new THREE.Vector3(-5, 5, 0), // 13
    new THREE.Vector3(-5, 9, -2), // 14
    new THREE.Vector3(-5, 9, 2), // 15
    new THREE.Vector3(-7, 13, 0), // 16
    new THREE.Vector3(-3, 13, 0), // 17
  ];

  const trianglesIndexes = [
    // face A
      2,11,0,
      2,3,4,
      5,4,3,
      4,5,6,
      4,6,7,
      4,7,10,
      4,10,11,
      4,11,2,
      0,11,13,
      12,13,15,
      12,15,16,
      16,15,17,
      17,15,7,
      7,15,10,
      11,10,15,
      13,11,15,
      // face B
      0,1,2,
      1,9,2,
      9,8,2,
      5,3,8,
      8,3,2,
      6,5,8,
      7,6,8,
      9,7,8,
      14,17,7,
      14,7,9,
      14,9,1,
      9,1,13,
      1,0,13,
      14,1,13,
      16,14,12,
      16,17,14,
      12,14,13
    ]

    return {
      vertices,
      trianglesIndexes
    }
}

function createHeartMesh (coordinatesList, trianglesIndexes) {
  const geo = new THREE.Geometry()
  const material = new THREE.MeshPhongMaterial( { color: 0xad0c00 } );
  const middlePoint = new THREE.Vector3()

  for (let i in trianglesIndexes) {
      if ((i+1)%3 === 0) {
          geo.vertices.push(coordinatesList[trianglesIndexes[i-2]], coordinatesList[trianglesIndexes[i-1]], coordinatesList[trianglesIndexes[i]])
          geo.faces.push(new THREE.Face3(i-2, i-1, i))
      }
  }

  geo.computeVertexNormals();

  const heartMesh = new THREE.Mesh(geo, material)

  return {
    geo,
    material,
    heartMesh
  }
}

function createRoom ({ width, height, depth }, scene) {
  const planeMaterial = new THREE.MeshPhongMaterial( {color: 0x241b61, side: THREE.DoubleSide} )
  for (let i = 0; i < 6; i++) {
    const geo = new THREE.PlaneGeometry( width, height, 2 )
    const rotationAngle = {
      axis: 'X',
      radiant: '0'
    }
    const translation = {
      x: 0,
      y: 0,
      z: 0
    }
    switch (i) {
      case 0:
        translation.z = -depth/2
        break;
      case 1:
        rotationAngle.radiant = -Math.PI * 0.5
        rotationAngle.axis = 'X'
        translation.y = -height/2
        break;
      case 2:
        rotationAngle.radiant = -Math.PI * 0.5
        rotationAngle.axis = 'X'
        translation.y = height/2
        break;
      case 3:
        rotationAngle.radiant = -Math.PI * 0.5
        rotationAngle.axis = 'Y'
        translation.x = -width/2
        break;
      case 4:
        rotationAngle.radiant = -Math.PI * 0.5
        rotationAngle.axis = 'Y'
        translation.x = width/2
        break;
      case 5:
        translation.z = depth/2
        break;
      default:
        break;
    }
    const plane = new THREE.Mesh(geo[`rotate${rotationAngle.axis}`](rotationAngle.radiant).translate(translation.x, translation.y, translation.z), planeMaterial)
    scene.add(plane)
  }

  // const plane = new THREE.Mesh( planeGeometry.translate(0, 0, -25), planeMaterial )  
  // scene.add(plane)
  // pGeom2 = new THREE.PlaneGeometry( 50, 50, 8 )
  // const plane2 = new THREE.Mesh( pGeom2.rotateX(-Math.PI * 0.5).translate(0, -25, 0), planeMaterial )
  // scene.add(plane2)
  // pGeom2 = new THREE.PlaneGeometry( 50, 50, 8 )
  // const plane3 = new THREE.Mesh( pGeom2.rotateX(-Math.PI * 0.5).translate(0, 25, 0),planeMaterial )
  // scene.add(plane3)
  // pGeom2 = new THREE.PlaneGeometry( 50, 50, 8 )
  // const plane4 = new THREE.Mesh( pGeom2.rotateY(-Math.PI * 0.5).translate(-25, 0, 0), planeMaterial )
  // scene.add(plane4)
  // pGeom2 = new THREE.PlaneGeometry( 50, 50, 8 )
  // const plane5 = new THREE.Mesh( pGeom2.rotateY(-Math.PI * 0.5).translate(25, 0, 0), planeMaterial )
  // scene.add(plane5)
}

function addWireFrameToMesh (mesh, geometry) {
  const wireframe = new THREE.WireframeGeometry( geometry );
  const lineMat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } );
  const line = new THREE.LineSegments( wireframe, lineMat );

  mesh.add(line)
}

function handleMouseIntersection (camera, scene, modal, meshUuid) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();  
  function onMouseIntersection( event ) {
    const coordinatesObject = event.changedTouches ? event.changedTouches[0] : event

    mouse.x = ( coordinatesObject.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( coordinatesObject.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    
    const intersects = raycaster.intersectObjects( scene.children );

    const modal = document.querySelector('.message')
    if ((event.target || event.targetTouches) === modal) return 
    if (intersects.length === 0) {
      closeModal(modal)
    }

    if (intersects.length && intersects[0].object.uuid === meshUuid) {
        modal.innerHTML = messages[intersects[0].faceIndex%messages.length]
        startAnim = true
    }

  }

  mouse.x = 1
  mouse.y = 1

  return {
    onMouseIntersection
  }
}

function beatingAnimation (mesh, callback) {
  if (mesh.scale.x < 1.4 && startAnim && !scaleThreshold) {
    mesh.scale.x += beatingIncrement
    mesh.scale.y += beatingIncrement
    mesh.scale.z += beatingIncrement
    if (mesh.scale.x >= 1.4) scaleThreshold = true
  } else if (scaleThreshold) {
    mesh.scale.x -= beatingIncrement
    mesh.scale.y -= beatingIncrement
    mesh.scale.z -= beatingIncrement
    if (mesh.scale.x <= 1) {
      scaleThreshold = startAnim = false
      callback()
    }
  } 
}

const toggleModal = side => modal => {
  const inClass = 'xyz-in'
  const outClass = 'xyz-out'
  const isOpening = side === 'open'
  isOpening && modal.classList.remove('message--initial')
  modal.classList.add(isOpening ? inClass : outClass)
  modal.classList.remove(isOpening ? outClass : inClass)
  // const classAction = ['remove', 'add']
}

const openModal = toggleModal('open')
const closeModal = toggleModal('close')

const messages = [
  'Je t\'aime !',
  'Toujours Manuefique',
  'La copine de mes rêves',
  'Coéquipière de cuisine préférée',
  'Professionnelle d\'idées de cadeaux',
  'On forme le plus intrépide équipage de kayak',
  'Tu rends même le confinement agréable',
  'Trop content de vivre dans notre appart',
  'Toujours #1 mondiale sur la peau douce',
  'Boss de l\'origami',
  'Chatouilleuse d\'élite',
  'On forme un duo de sport d\'exception',
  'Brodeuse talentueuse',
  'Reine des brioches',
  'Love you ❤',
  'Plus beaux yeux du monde connu',
  'Partenaire de résolution d\'énigmes',
  'Dessinatrice de talent',
  'Fessier de déesse',
  'Sensible et empathique',
  'Gentille et compréhensive',
  'Douce et voluptueuse', //22
  'La plus choupinette',
  'Les voisins me regardent avec jalousie par la fenêtre',
  'Je réactive les notifications pour toi',
]

init()
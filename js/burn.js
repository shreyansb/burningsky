console.log("hi");

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;

var camera, controls, scene, renderer;

var sky, sunSphere;

var distance            = 400000,
    azimuth             = 0.25, // facing front
    inclinationHigh     = 0.52,
    inclinationLow      = 0.47,
    inclination         = inclinationHigh,
    inclinationDirection= -1,
    inclinationDelta    = 0.0001,
    turbidity           = 10,
    reileigh            = 2,
    mieDirectionalG     = 0.8,
    mieCoefficient      = 0.005,
    luminance           = 1;

function init() {
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 100, 2000000 );
    camera.position.set( 0, -400, 2000 );

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );
    controls.enableZoom = false;
    controls.enablePan = false;

    window.addEventListener( 'resize', onWindowResize, false );

    initSky();
    render();
}

function initSky() {
    // Add Sky Mesh
    sky = new THREE.Sky();
    scene.add( sky.mesh );

    // Add Sun Helper
    sunSphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry( 20000, 16, 8 ),
        new THREE.MeshBasicMaterial( { color: 0xffffff } )
    );
    sunSphere.position.y = - 700000;
    sunSphere.visible = false;
    scene.add( sunSphere );
}

function render() {

    var uniforms = sky.uniforms;
    uniforms.turbidity.value        = turbidity;
    uniforms.reileigh.value         = reileigh;
    uniforms.luminance.value        = luminance;
    uniforms.mieCoefficient.value   = mieCoefficient;
    uniforms.mieDirectionalG.value  = mieDirectionalG;
    sunSphere.visible = false;

    // animate the sun's inclination change, i.e. sunrise and sunset
    if (inclination < inclinationLow && inclinationDirection == -1) {
        inclinationDirection = 1;
    }
    if (inclination > inclinationHigh && inclinationDirection == 1) {
        inclinationDirection = -1;
    }
    inclination = inclination + (inclinationDelta * inclinationDirection);

    var sunPosition = inclinationToPosition(inclination, azimuth);
    sunSphere.position.x = sunPosition[0];
    sunSphere.position.y = sunPosition[1];
    sunSphere.position.z = sunPosition[2];

    sky.uniforms.sunPosition.value.copy( sunSphere.position );

    requestAnimationFrame( render );
    renderer.render( scene, camera );

}

function inclinationToPosition(inclination, azimuth) {
    var x, y, z;
    var theta = Math.PI * ( inclination - 0.5 );
    var phi = 2 * Math.PI * ( azimuth - 0.5 );

    x = distance * Math.cos( phi );
    y = distance * Math.sin( phi ) * Math.sin( theta );
    z = distance * Math.sin( phi ) * Math.cos( theta );

    return [x, y, z];
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();
}

init();


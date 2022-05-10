// 1. Enable shadow mapping in the renderer. 
// 2. Enable shadows and set shadow parameters for the lights that cast shadows. 
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows. 
// 3. Indicate which geometry objects cast and receive shadows.

"use strict"; 

import * as THREE from '../libs/three.js/three.module.js'
import { OrbitControls } from '../libs/three.js/controls/OrbitControls.js';
import { OBJLoader } from '../libs/three.js/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/three.js/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null, group = null, orbitControls = null;

let duration = 20000; // ms
let currentTime = Date.now();

let directionalLight = null, spotLight = null, ambientLight = null;

let mapUrl = "../images/checker_large.gif";





//Mesa de pinguino
let objMtlMesaUrl={obj:'../models/pingPongMesa/10520_pingpongtable_L2.obj', mtl:'../models/pingPongMesa/10520_pingpongtable_L2.mtl'};

//Raqueta
let objMtlRaquetaUrl={obj:'../models/pintPongRaqueta/10519_Pingpong_paddle_v1_L3.obj', mtl:'../models/pintPongRaqueta/10519_Pingpong_paddle_v1_L3.mtl'};

let objMtlSonicUrl={obj:'../models/Sonic/son_M.obj', mtl:'../models/Sonic/son_M.mtl'};



function main()
{
    const canvas = document.getElementById("webglcanvas");

    createScene(canvas);

    update();
}

function onError ( err ){ console.error( err ); };

function onProgress( xhr ) 
{
    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( xhr.target.responseURL, Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}





async function loadObjMtlMesa(objModelUrl)
{
    try
    {
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync(objModelUrl.mtl);

        materials.preload();
        
        const objLoader = new OBJLoader();

        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync(objModelUrl.obj);


        object.traverse(function (child) {
            if (child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        //console.log(object);

        object.position.y = 0;
        object.rotation.x = Math.PI*(1.5);
        object.scale.set(0.1, 0.1, 0.1);
        scene.add(object);
      
        
    }
    catch (err)
    {
        onError(err);
    }
}


async function loadObjMtlRaqueta(objModelUrl)
{
    try
    {
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync(objModelUrl.mtl);

        materials.preload();
        
        const objLoader = new OBJLoader();

        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync(objModelUrl.obj);


        object.traverse(function (child) {
            if (child.isMesh)
            {
                // child.castShadow = false;
                // child.receiveShadow = false;
            }
        });
        
        //console.log(object);

         //object.position.y = 0;
         object.position.set(0,9,15);
         object.rotation.x = Math.PI*(1.5);
         object.scale.set(0.1, 0.1, 0.1);
        scene.add(object);

        //Copia de raqueta
        let copia_raqueta=object.clone();
        object.position.set(0,9,-15);
       
        scene.add(copia_raqueta);

      
        
    }
    catch (err)
    {
        onError(err);
    }
}

async function loadObjMtlSonic(objModelUrl)
{
    try
    {
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync(objModelUrl.mtl);

        materials.preload();
        
        const objLoader = new OBJLoader();

        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync(objModelUrl.obj);


        object.traverse(function (child) {
            if (child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        //console.log(object);

        object.position.set(20,0,0);
        object.rotation.y = Math.PI*(1.5);
        object.scale.set(1, 1, 1);
        scene.add(object);
        
        
    }
    catch (err)
    {
        onError(err);
    }
}


function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;


}

function update() 
{
    requestAnimationFrame(function() { update(); });
    
    // Render the scene
    renderer.render( scene, camera );

    // Spin the cube for next frame
    animate();

    // Update the camera controller
    orbitControls.update();
}

function createScene(canvas) 
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);


    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-2,20, 25);

    orbitControls = new OrbitControls(camera, renderer.domElement);
        
    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xaaaaaa, 1.0);
    // Create and add all the lights
    directionalLight.position.set(0, 5, 0);
    directionalLight.target.position.set(0,0,0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight( 0xaaaaaa, 2.0);
    // Create and add all the lights
    directionalLight2.position.set(0, 15, 15);
    directionalLight2.target.position.set(0,15,0);
    scene.add(directionalLight2);


    ambientLight = new THREE.AmbientLight ( 0x444444, 1.2);
    scene.add(ambientLight);
    
    // Create the objects
    loadObjMtlMesa(objMtlMesaUrl);
    loadObjMtlRaqueta(objMtlRaquetaUrl);
    loadObjMtlSonic(objMtlSonicUrl);


    // Create a group to hold the objects
    group = new THREE.Object3D;
    scene.add(group);

    // Create a texture map
    const map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    // Put in a ground plane to show off the lighting
    let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    group.add( mesh );
    

}

main();
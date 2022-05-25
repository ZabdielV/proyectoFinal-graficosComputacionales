// 1. Enable shadow mapping in the renderer. 
// 2. Enable shadows and set shadow parameters for the lights that cast shadows. 
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows. 
// 3. Indicate which geometry objects cast and receive shadows.

"use strict"; 

import * as THREE from '../libs/three.js/three.module.js'
import { OrbitControls } from '../libs/three.js/controls/OrbitControls.js';
import { OBJLoader } from '../libs/three.js/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/three.js/loaders/MTLLoader.js';
import { FBXLoader } from '../../libs/three.js/loaders/FBXLoader.js';
let renderer = null, scene = null, camera = null, group = null, orbitControls = null,sphere= null,cube1= null,direccion= null;
let sphereCollider=null,boxCollider=null;
let cube2=null,boxCollider2=null,paredCollider1=null,paredCollider2=null,paredCollider3=null,paredCollider4=null;
let meshPared1=null,meshPared2=null,meshPared3=null,meshPared4=null;
let cheerAnimation=null;
let movimientoX=1,movimientoZ=1;
let duration = 20000; // ms
let currentTime = Date.now();

let directionalLight = null, spotLight = null, ambientLight = null;

let mapUrl = "../images/checker_large.gif";





//Mesa 
let objMtlMesaUrl={obj:'../models/pingPongMesa/10520_pingpongtable_L2.obj', mtl:'../models/pingPongMesa/10520_pingpongtable_L2.mtl'};

//Raqueta
let objMtlRaquetaUrl={obj:'../models/pintPongRaqueta/10519_Pingpong_paddle_v1_L3.obj', mtl:'../models/pintPongRaqueta/10519_Pingpong_paddle_v1_L3.mtl'};

//let objMtlSonicUrl={obj:'../models/Sonic/son_M.obj', mtl:'../models/Sonic/son_M.mtl'};



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
        copia_raqueta.position.set(0,9,-15);
       
        scene.add(copia_raqueta);

      
        
    }
    catch (err)
    {
        onError(err);
    }
}

function setVectorValue(vector, configuration, property, initialValues)
{
    if(configuration !== undefined)
    {
        if(property in configuration)
        {
            console.log("setting:", property, "with", configuration[property]);
            vector.set(configuration[property].x, configuration[property].y, configuration[property].z);
            return;
        }
    }

    console.log("setting:", property, "with", initialValues);
    vector.set(initialValues.x, initialValues.y, initialValues.z);
}

async function loadFBXSonic(fbxModelUrl, configuration)
{
    try{
        let object = await new FBXLoader().loadAsync(fbxModelUrl);

        setVectorValue(object.position, configuration, 'position', new THREE.Vector3(0,0,0));
        setVectorValue(object.scale, configuration, 'scale', new THREE.Vector3(1, 1, 1));
        setVectorValue(object.rotation, configuration, 'rotation', new THREE.Vector3(0,0,0));
        console.log(object);
        //animaciob
        const animacion=object.animations[1];
        //cheerAnimation= new THREE.AnimationMixer( scene ).clipAction(animacion, object);
        //animacion1.play();

        object.rotation.y = Math.PI*(1.5);
        
        scene.add( object );
    }
    catch(err)
    {
        console.error( err );
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
    var result = 0;

    //movimiento pelota
    //sphereCollider.center.set(sphere.position.x, sphere.position.y, sphere.position.z);
    sphere.position.z +=angle*60*movimientoZ;
    sphere.position.x += angle*1*movimientoX;
    sphere.position.y = -((sphere.position.z - 1) * (sphere.position.z - 1) / 30) + 15;

    //se produce colision en juador
    if(sphereCollider.intersectsBox(boxCollider)){

        golpePelotaEnJugador();
        
    }
    //se produce colision en CPU
    if(sphereCollider.intersectsBox(boxCollider2)){
        golpePelotaEnCPU();
        }
        
    //Si choca con pared derecho
    if(sphereCollider.intersectsBox(paredCollider1)){
        movimientoX*=-1;
     }

    //Si choca con pared izquerda
    if(sphereCollider.intersectsBox(paredCollider2)){
        movimientoX*=-1;
     }


    //cube1.position.x+=angle*1.5;
    //boxCollider.setFromObject(cube1);
}

function golpePelotaEnJugador(){
    console.log("colision");
    var fuerza=Math.random()*10;
    var movimiento=Math.random() > 0.5 ? -1 : 1;
   // movimientoX=(sphere.position.x-cube1.position.x)/5;
   movimientoX=fuerza*movimiento;
    movimientoZ*=-1;
}

function golpePelotaEnCPU(){
    console.log("colision");
    var fuerza=Math.random()*10;
    var movimiento=Math.random() > 0.5 ? -1 : 1;
   // movimientoX=(sphere.position.x-cube1.position.x)/5;
   movimientoX=fuerza*movimiento;
    movimientoZ*=-1;
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

    direccion=1;

    
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
    loadFBXSonic('../models/Sonic/Cheering sonic.fbx',{position: new THREE.Vector3(20, 0, 0), scale:new THREE.Vector3(1, 1, 1) });
   // loadObjMtlSonic(objMtlSonicUrl);


    //Create spheare
    const geometrySphere = new THREE.SphereGeometry( 0.5, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    sphere = new THREE.Mesh( geometrySphere, material );
    sphere.position.set(0,10,0);
    scene.add( sphere );

    //Create collider for sphere
    sphereCollider=new THREE.Sphere(sphere.position,  0.5);

    //CREATE BOX player
    const geometryBox1 = new THREE.BoxGeometry( 16, 10, 0.1 );
    const materialBox1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    cube1 = new THREE.Mesh( geometryBox1, materialBox1 );
    scene.add( cube1 );
    cube1.position.set(0,10,14);
    //cube1.visible = false;
    //Box collider
    boxCollider = new THREE.Box3().setFromObject(cube1);


     //CREATE BOX CPU
     const geometryBox2 = new THREE.BoxGeometry( 16, 10, 0.1 );
     const materialBox2 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
     cube2 = new THREE.Mesh( geometryBox2, materialBox2 );
     scene.add( cube2 );
     cube2.position.set(0,10,-14);
     //cube1.visible = false;
     //Box collider
     boxCollider2 = new THREE.Box3().setFromObject(cube2);

    //Pared derecha
    const geometryBox3 = new THREE.BoxGeometry( 30, 10, 0.1 );
    const materialBox3 = new THREE.MeshBasicMaterial( {color:0xff0000 } );
    meshPared1 = new THREE.Mesh( geometryBox3, materialBox3 );
    scene.add( meshPared1 );
    meshPared1.rotation.y=Math.PI*(1.5);
    meshPared1.position.set(8,10,0);
    //cube1.visible = false;
    //Box collider
    paredCollider1 = new THREE.Box3().setFromObject(meshPared1);
    
     //Pared izquierda
     const geometryBox4 = new THREE.BoxGeometry( 30, 10, 0.1 );
     const materialBox4 = new THREE.MeshBasicMaterial( {color:0xff0000 } );
     meshPared2 = new THREE.Mesh( geometryBox4, materialBox4 );
     scene.add( meshPared2 );
     meshPared2.rotation.y=Math.PI*(1.5);
     meshPared2.position.set(-8,10,0);
     //cube1.visible = false;
     //Box collider
     paredCollider2 = new THREE.Box3().setFromObject(meshPared2);


    //Collider que defecta si la pelota se le fua al Jugador
    const geometryBox5 = new THREE.BoxGeometry( 15, 10, 0.1 );
    const materialBox5 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    meshPared3 = new THREE.Mesh( geometryBox5, materialBox5 );
    scene.add( meshPared3 );
    meshPared3.position.set(0,10,18);
    //cube1.visible = false;
    //Box collider
    paredCollider3 = new THREE.Box3().setFromObject(meshPared3);


       //Collider que defecta si la pelota se le fua al Jugador
       const geometryBox6 = new THREE.BoxGeometry( 15, 10, 0.1 );
       const materialBox6 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
       meshPared4 = new THREE.Mesh( geometryBox6, materialBox6 );
       scene.add( meshPared4 );
       meshPared4.position.set(0,10,-18);
       //cube1.visible = false;
       //Box collider
       paredCollider4 = new THREE.Box3().setFromObject(meshPared4);

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
function resize()
{
    const canvas = document.getElementById("webglcanvas");

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    //camera.aspect = canvas.width / canvas.height;

    //camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
}
main();

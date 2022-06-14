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
let powerUpCollider = null;
let cube2=null,boxCollider2=null,paredCollider1=null,paredCollider2=null,paredCollider3=null,paredCollider4=null;
let meshPared1=null,meshPared2=null,meshPared3=null,meshPared4=null;
let cheerAnimation=null;
let iniciarMovimientoPelota=false;
let soundPing=null,soundGG=null,soundPoint=null;
let movimientoX=1,movimientoZ=1;
let duration = 20000; // ms
let currentTime = Date.now();
let puntosJugador=0,puntosCPU=0,vidas=3;
let puntosMod = 1;
let cpuSpeed = 0.2;
let raquetaJugador=null,raquetaCPU=null;

let directionalLight = null, spotLight = null, ambientLight = null;

let mapUrl = "../images/checker_large.gif";

const canvas = document.getElementById("webglcanvas");


let powerUpDelta = 6000 //miliseg
let lastPowerUp = Date.now();
let powerUpCollisioner = {};
let powerUpsRef = {}
let powerUpPresent = false;
let powerUpUsed = false;
window.x = powerUpsRef;


//Mesa 
let objMtlMesaUrl={obj:'../models/pingPongMesa/10520_pingpongtable_L2.obj', mtl:'../models/pingPongMesa/10520_pingpongtable_L2.mtl'};

//Raqueta
let objMtlRaquetaUrl={obj:'../models/pintPongRaqueta/10519_Pingpong_paddle_v1_L3.obj', mtl:'../models/pintPongRaqueta/10519_Pingpong_paddle_v1_L3.mtl'};

//let objMtlSonicUrl={obj:'../models/Sonic/son_M.obj', mtl:'../models/Sonic/son_M.mtl'};

//powerup
let objMtlPowerUpsUrl = [
        {obj:'../models/powerups/Heart.obj', mtl:'../models/powerups/Heart.mtl', name:'heart'},
        {obj:'../models/powerups/Lightning.obj', mtl:'../models/powerups/Lightning.mtl', name:'light'},
        {obj:'../models/powerups/Multiplier.obj', mtl:'../models/powerups/Multiplier.mtl', name:'mult'}
    ];

function main()
{
    const canvas = document.getElementById("webglcanvas");
    

    createScene(canvas);

    update();

    //inicia el movimietno despues de 4 segundos
    Math.random() > 0.5 ? movimientoZ*=1 : movimientoZ*=-1;
    setInterval(()=>{
        iniciarMovimientoPelota=true
        
        window.addEventListener('mousemove', mousemove);
    },4000)
    
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

function loadObjMtlPowerUps(objModelsUrls)
{

    objModelsUrls.forEach(async objModelUrl=>{
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
             
            switch(objModelUrl.name){
                case "heart":
                    object.position.y = 20;
                    object.scale.set(1,1,1);
                    object.name="heart"
                    powerUpsRef.heart = object;
                    break;
                case "light":
                    object.position.y = 20;
                    object.position.x = 5;
                    object.name="light"
                    object.scale.set(1,1,1);
                    powerUpsRef.light = object;
                    break;
                case "mult":
                    object.position.y = 20;
                    object.position.x = -5;
                    object.name="mult"
                    object.scale.set(4,4,4);
                    powerUpsRef.mult = object;
                    break;
                // case "three":
                //     object.position.y = 20;
                //     object.position.x = 10;
                //     object.name="three"
                //     object.scale.set(1,1,1);
                //     scene.add(object);
                //     powerUpsRef.three = object;
                //     break;
                // case "stick":
                //     object.position.y = 20;
                //     object.position.x = -10;
                //     object.name="stick"
                //     object.scale.set(2,2,2);
                //     scene.add(object);
                //     powerUpsRef.stick = object;
                //     break;
                default:
                    break;
            }
            
        }
        catch (err)
        {
            onError(err);
        }
    })    
    
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

        //const object = await objLoader.loadAsync(objModelUrl.obj);
        raquetaJugador = await objLoader.loadAsync(objModelUrl.obj);

        raquetaJugador.traverse(function (child) {
            if (child.isMesh)
            {
                 child.castShadow = false;
                 child.receiveShadow = false;
            }
        });
        
        //console.log(object);

         //object.position.y = 0;
         raquetaJugador.position.set(0,9,15);
         raquetaJugador.rotation.x = Math.PI*(1.5);
         raquetaJugador.scale.set(0.1, 0.1, 0.1);
        scene.add(raquetaJugador);

        //Copia de raqueta
        //let copia_raqueta=object.clone();
        //copia_raqueta.position.set(0,9,-15);
        //scene.add(copia_raqueta);
        raquetaCPU=raquetaJugador.clone();
        raquetaCPU.position.set(0,9,-15);
        scene.add(raquetaCPU);
      
        
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
        //console.log(object);


    //     const cheerAnimation = new THREE.AnimationMixer(scene);
    //   var action = cheerAnimation.clipAction(object.animations[0],object);
    //   action.play();
    //   object.updateMatrix();
    //     object.rotation.y = Math.PI*(1.5);
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

    if(lastPowerUp + powerUpDelta <= now && !powerUpPresent){
        lastPowerUp = now;
        let randomPowerup = Math.floor(Math.random() * (2 - 0 + 1) + 0)
        let refPowerup;
        Object.keys(powerUpsRef).forEach((e, i) => {
            if(i == randomPowerup)
                refPowerup = powerUpsRef[e];
        })
        let x = refPowerup.clone();
        
        x.position.y = 13;
        x.position.x = (Math.random() * (5 + 5) - 5)
        let collision = new THREE.Box3(x.position.clone().addScalar(-2), x.position.clone().addScalar(2));
        powerUpCollisioner = {col:collision, obj:x, type:x.name};
        scene.add(x)
        powerUpPresent = true;
    }
    try{
        if(sphereCollider.intersectsBox(powerUpCollisioner.col) ){
            let tmp = powerUpCollisioner;
            powerUpCollisioner = {};
            scene.remove(tmp.obj)
            powerUpPresent = false;
            //console.log("Powerup ha sido tocad. Tipo: ", tmp.type)
            switch (tmp.type){
                case "heart":
                    //console.log("Entrando efecto");
                    agregarVidas();
                    break;
                case "light":
                    speedUp();
                    break;
                case "mult":
                    console.log("entre a mult");
                    puntosMod += 0.5;
                    break;
                default:

                    break;
            }
        }
    }catch(e){}
    

    //movimiento pelota
    if(iniciarMovimientoPelota){
        //Actualizar la posicion del collider
        sphereCollider.center.set(sphere.position.x, sphere.position.y, sphere.position.z);
        //Actualizar la posicion del mesh
        sphere.position.z +=angle*60*movimientoZ;
        sphere.position.x += angle*1*movimientoX;
        sphere.position.y = -((sphere.position.z - 1) * (sphere.position.z - 1) / 30) + 15;
        procesarMovimientoCPU();
    }

    //se produce colision en juador
    if(sphereCollider.intersectsBox(boxCollider)){

        golpePelotaEnJugador();
        soundPing.play();
    }
    //se produce colision en CPU
    if(sphereCollider.intersectsBox(boxCollider2)){
        golpePelotaEnCPU();
        soundPing.play();
        }
        
    //Si choca con pared derecho
    if(sphereCollider.intersectsBox(paredCollider1)){
        movimientoX*=-1;
     }

    //Si choca con pared izquerda
    if(sphereCollider.intersectsBox(paredCollider2)){
        movimientoX*=-1;
     }


     //Si le marcan punto al jugador
     if(sphereCollider.intersectsBox(paredCollider3)){
        sumarPuntoCPU()
        reiniciarPelota()
        soundGG.play();
        quitarVidas()
        
        
     }

    //Si le marcan punto al jugador
    if(sphereCollider.intersectsBox(paredCollider4)){
        sumarPuntoJugador()
        reiniciarPelota()
        soundPoint.play();
    }
}

function golpePelotaEnJugador(){
   // console.log("colision");
    var fuerza=Math.random()*10;
    var movimiento=Math.random() > 0.5 ? -1 : 1;
   movimientoX=fuerza*movimiento;
    movimientoZ*=-1;
}

function golpePelotaEnCPU(){
    //console.log("colision");
    var fuerza=Math.random()*10;
    var movimiento=Math.random() > 0.5 ? -1 : 1;
   movimientoX=fuerza*movimiento;
    movimientoZ*=-1;
}

function reiniciarPelota(){
    iniciarMovimientoPelota=false;
    sphere.position.set(0,10,0);
    cube2.position.x=0.0;
    raquetaCPU.position.x=cube2.position.x
    boxCollider2.setFromObject(cube2);
    Math.random() > 0.5 ? movimientoZ =1 : movimientoZ=-1;
    //Delay de 3 segundos
    setInterval(()=>{
    iniciarMovimientoPelota=true;
    },4500);
    lastPowerUp = Date.now();
    puntosMod = 1;
}

function sumarPuntoJugador(){
    puntosJugador+= 2**Math.ceil(puntosMod);
    document.getElementById("puntosJugador").innerHTML=`Score player: ${puntosJugador}`;
}

function sumarPuntoCPU(){
    puntosCPU+= 2**Math.floor(puntosMod);
    document.getElementById("puntosCPU").innerHTML=`Score CPU: ${puntosCPU}`;
}

function quitarVidas(){
    vidas--
    document.getElementById("vidas").innerHTML=`Vidas: ${vidas}`;

    if(vidas<=0){
        iniciarMovimientoPelota=false
        window.alert(`GG, ya no tienes vidas, puntos obtenidos ${puntosJugador}`);
        window.location = '/';   
    }
}

function agregarVidas(){
    vidas+=0.5
    vidas = Math.ceil(vidas);
    document.getElementById("vidas").innerHTML=`Vidas: ${vidas}`;
}

function speedUp(){
    movimientoZ *= 1.225;
}

function procesarMovimientoCPU(){

    //Se empeiza a mover cuando la pelota este a cierta distancia
    if(sphere.position.z<=-5){

        //Cuando la pelota se va a al izquierda
        if(cube2.position.x>sphere.position.x){
            cube2.position.x -=cpuSpeed;
            boxCollider2.setFromObject(cube2);
            raquetaCPU.position.x=cube2.position.x
        }
        //cuando la pelota va a la derecha
        else if(cube2.position.x<sphere.position.x){
            cube2.position.x +=cpuSpeed;
            boxCollider2.setFromObject(cube2);
            raquetaCPU.position.x=cube2.position.x
        }
    }

}

function update() 
{
    requestAnimationFrame(function() { update(); });
    
    // Render the scene
    renderer.render( scene, camera );

    // Spin the cube for next frame
    animate();

    // Update the camera controller
    //orbitControls.update()

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

    //camera = new THREE.OrthographicCamera( canvas.width / - 2, canvas.width / 2, canvas.height / 2, canvas.height / - 2, 1, 1000 );
    camera.position.set(0, 20, 35);
    camera.lookAt(0,10,0)

    const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
soundPing = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( './sounds/ping.ogg', function( buffer ) {
	soundPing.setBuffer( buffer );
	soundPing.setLoop( false );
	soundPing.setVolume( 0.85 );
	
});

// create a global audio source
soundGG = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader2 = new THREE.AudioLoader();
audioLoader2.load( './sounds/gg.ogg', function( buffer ) {
	soundGG.setBuffer( buffer );
	soundGG.setLoop( false );
	soundGG.setVolume( 0.80 );
	
});

// create a global audio source
soundPoint = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader3 = new THREE.AudioLoader();
audioLoader3.load( './sounds/point.ogg', function( buffer ) {
	soundPoint.setBuffer( buffer );
	soundPoint.setLoop( false );
	soundPoint.setVolume( 0.80 );
	
});

        
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
    loadObjMtlPowerUps(objMtlPowerUpsUrl);
    loadFBXSonic('../models/Sonic/Cheering sonic.fbx',{position: new THREE.Vector3(20, 0, 0), scale:new THREE.Vector3(1, 1, 1) });
   // loadObjMtlSonic(objMtlSonicUrl);


    //Create spheare (pelota)
    const geometrySphere = new THREE.SphereGeometry( 0.5, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    sphere = new THREE.Mesh( geometrySphere, material );
    sphere.position.set(0,10,0);
    scene.add( sphere );

    //Create collider for sphere
    sphereCollider=new THREE.Sphere(sphere.position,  0.5);

    //CREATE BOX player
    const geometryBox1 = new THREE.BoxGeometry( 1.8, 10, 0.1 );
    const materialBox1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    cube1 = new THREE.Mesh( geometryBox1, materialBox1 );
    scene.add( cube1 );
    cube1.position.set(0,10,14);
    cube1.visible = false;
    //Box collider
    boxCollider = new THREE.Box3().setFromObject(cube1);


     //CREATE BOX CPU
     const geometryBox2 = new THREE.BoxGeometry(1.8, 10, 0.1 );
     const materialBox2 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
     cube2 = new THREE.Mesh( geometryBox2, materialBox2 );
     scene.add( cube2 );
     cube2.position.set(0,10,-14);
     cube2.visible = false;
     //Box collider
     boxCollider2 = new THREE.Box3().setFromObject(cube2);

    //Pared derecha
    const geometryBox3 = new THREE.BoxGeometry( 30, 10, 0.1 );
    const materialBox3 = new THREE.MeshBasicMaterial( {color:0xff0000 } );
    meshPared1 = new THREE.Mesh( geometryBox3, materialBox3 );
    scene.add( meshPared1 );
    meshPared1.rotation.y=Math.PI*(1.5);
    meshPared1.position.set(8,10,0);
    meshPared1.visible = false;
    //Box collider
    paredCollider1 = new THREE.Box3().setFromObject(meshPared1);
    
     //Pared izquierda
     const geometryBox4 = new THREE.BoxGeometry( 30, 10, 0.1 );
     const materialBox4 = new THREE.MeshBasicMaterial( {color:0xff0000 } );
     meshPared2 = new THREE.Mesh( geometryBox4, materialBox4 );
     scene.add( meshPared2 );
     meshPared2.rotation.y=Math.PI*(1.5);
     meshPared2.position.set(-8,10,0);
     meshPared2.visible = false;
     //Box collider
     paredCollider2 = new THREE.Box3().setFromObject(meshPared2);


    //Collider que defecta si la pelota se le fua al Jugador
    const geometryBox5 = new THREE.BoxGeometry( 16, 10, 0.1 );
    const materialBox5 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    meshPared3 = new THREE.Mesh( geometryBox5, materialBox5 );
    scene.add( meshPared3 );
    meshPared3.position.set(0,10,15);

    //Box collider
    paredCollider3 = new THREE.Box3().setFromObject(meshPared3);
    meshPared3.visible = false;

       //Collider que defecta si la pelota se le fua al Jugador
       const geometryBox6 = new THREE.BoxGeometry( 16, 10, 0.1 );
       const materialBox6 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
       meshPared4 = new THREE.Mesh( geometryBox6, materialBox6 );
       scene.add( meshPared4 );
       meshPared4.position.set(0,10,-15);
       //Box collider
       paredCollider4 = new THREE.Box3().setFromObject(meshPared4);
       meshPared4.visible = false;

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
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    camera.aspect = canvas.width / canvas.height;

    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
}

function mousemove(event){
    //console.log((canvas.width / 2) - 5)
    
    if(event.clientX >= (canvas.width / 2) + 150 || event.clientX <= (canvas.width / 2) - 150){
        console.log("limite alcanzado")
    }else{
        cube1.position.set((event.clientX - (canvas.width / 2))*(0.05), 10, 14);
        boxCollider.setFromObject(cube1);
        raquetaJugador.position.x=cube1.position.x
    }
}

window.onload = () => {

    resize(); 
};

main();



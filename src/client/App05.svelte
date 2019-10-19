<script>
  //https://medium.com/@bluemagnificent/intro-to-javascript-3d-physics-using-ammo-js-and-three-js-dd48df81f591
  //https://stackoverflow.com/questions/31991267/bullet-physicsammo-js-in-asm-js-how-to-get-collision-impact-force
  import { onMount, onDestroy, createEventDispatcher} from 'svelte';
  import { generateId } from './generateid';
  //import { gun, onLogin } from './mjs';


  let idcomponent = "main-" + generateId();
  let elcomponent;
  let idnav = "nav-" + generateId();
  let elnav;
  let idcontent = "content-" + generateId();
  let elcontent;
  let navheight = 22;

  let scene;
  let camera;
  let renderer;
  let cube;
  let clock = new THREE.Clock();

  let rigidBodies = [], tmpTrans;

  // http://bulletphysics.org/Bullet/BulletFull/classbtCollisionObject.html
  let CollisionFlags = {
    CF_STATIC_OBJECT : 1,
    CF_KINEMATIC_OBJECT : 2,
    CF_NO_CONTACT_RESPONSE : 4,
    CF_CUSTOM_MATERIAL_CALLBACK : 8,
    CF_CHARACTER_OBJECT : 16,
    CF_DISABLE_VISUALIZE_OBJECT : 32,
    CF_DISABLE_SPU_COLLISION_PROCESSING : 64
  };

  // http://bulletphysics.org/Bullet/BulletFull/btCollisionObject_8h.html
  var DISABLE_DEACTIVATION = 4;

  var w, h, canvas, ctx, world, body, sensorBody, radius=1, transform, dispatcher, sensorBodyOverlapped, bodyOverlapped;
  var last_simulation_time = Date.now();
  var objects = {};

  function handle_auto_resize(event){
    //if(elcomponent == null){
      //return;
    //}
    //console.log("resize");
    let parent = elcomponent.parentNode;
    elcomponent.style.height = parent.clientHeight + 'px';
    elcomponent.style.width = parent.clientWidth + 'px';

    elnav.style.height = navheight + 'px';
    elnav.style.width = parent.clientWidth + 'px';

    elcontent.style.height = (parent.clientHeight - navheight) + 'px';
    elcontent.style.width = parent.clientWidth + 'px';

    //renderer.setSize( window.innerWidth, (window.innerHeight - 22) );
  }

  onMount(() => {
    elcomponent = document.getElementById(idcomponent);
    elnav = document.getElementById(idnav);
    elcontent = document.getElementById(idcontent);
    //initScene();
    initPhysics();
    handle_auto_resize();
    window.addEventListener('resize', handle_auto_resize);
    window.dispatchEvent(new Event('resize'));
  });
  //https://medium.com/@bluemagnificent/intro-to-javascript-3d-physics-using-ammo-js-and-three-js-dd48df81f591
  function initPhysics(){
    Ammo().then( startPhysics )
  }
  let pos;
  function startPhysics(){
    //setupPhysicsWorld();
    //createBlock();
    //createBall();
    transform = new Ammo.btTransform();
    pos= new Ammo.btVector3();
    init();
    animate();
  }

  let physicsWorld;

  function setupPhysicsWorld(){

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();
    //console.dir(Ammo.Runtime.addFunction);
    console.dir(Ammo.addFunction);
    //var collisionCallbackPointer = Ammo.Runtime.addFunction(collisionCallbackFunc);
    
    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
    //physicsWorld.setContactProcessedCallback(collisionCallbackPointer);
    //physicsWorld.setContactAddedCallback(collisionCallbackPointer);
    console.log(physicsWorld);

    tmpTrans = new Ammo.btTransform();
  }

  function init(){
    
    // Init canvas
    canvas = document.getElementById("myCanvas");
    w = canvas.width;
    h = canvas.height;
    ctx = canvas.getContext("2d");
    ctx.fillStyle='green';
    
    // Init world
    var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    var solver = new Ammo.btSequentialImpulseConstraintSolver();
    var broadphase = new Ammo.btDbvtBroadphase();
    world = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
    world.setGravity(new Ammo.btVector3(0,0,0));
    
    // Create sphere
    var localInertia = new Ammo.btVector3(0,0,0);
    var mass = 1;
    var shape = new Ammo.btSphereShape( radius );
    shape.calculateLocalInertia( mass, localInertia );
    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(3,0,0));
    var motionState = new Ammo.btDefaultMotionState( transform );
    var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
    body = new Ammo.btRigidBody( rbInfo );
    Ammo.destroy(rbInfo);
    body.setCollisionFlags( body.getCollisionFlags());
    world.addRigidBody( body );
    var ptr = body.a || body.ptr;
    objects[ptr] = body;
    body.setActivationState( DISABLE_DEACTIVATION );
    
    // Create sensor sphere
    var localInertia = new Ammo.btVector3(0,0,0);
    var mass = 1;
    var shape = new Ammo.btSphereShape( radius );
    shape.calculateLocalInertia( mass, localInertia );
    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0,0,0));
    var motionState = new Ammo.btDefaultMotionState( transform );
    var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
    sensorBody = new Ammo.btRigidBody( rbInfo );
    Ammo.destroy(rbInfo);
    sensorBody.setCollisionFlags( sensorBody.getCollisionFlags() | CollisionFlags.CF_NO_CONTACT_RESPONSE );
    world.addRigidBody( sensorBody );
    var ptr = sensorBody.a || sensorBody.ptr;
    objects[ptr] = sensorBody;
    sensorBody.setActivationState( DISABLE_DEACTIVATION );
  }

  function drawCircle(ctx,body,overlapped){
    ctx.beginPath();
    ctx.fillStyle = overlapped ? 'red' : 'green';
    var transform = body.getCenterOfMassTransform();
    var origin = transform.getOrigin();
    var rotation = transform.getRotation();
    ctx.arc(origin.x(), origin.y(), radius, 0, 2*Math.PI);
    ctx.fill();
  }

  function animate(t){
    t = (t || 0) / 1000;
    requestAnimationFrame(animate);
    
    // Set position of the body
    transform.setIdentity();
    pos.setX(Math.sin(t) * 3);
    transform.setOrigin(pos);
    body.setWorldTransform(transform);
    
    var now = Date.now();
    var dt = ( now - last_simulation_time ) / 1000;
    world.stepSimulation( dt, 3, 1/60 );
    
    last_simulation_time = now;
    
    sensorBodyOverlapped = false;
    bodyOverlapped = false;
    
    var dp = world.getDispatcher(),
        num = dp.getNumManifolds();
    
    for(var i = 0; i < num; i++ ) {
      var manifold = dp.getManifoldByIndexInternal( i );
      
      var num_contacts = manifold.getNumContacts();
      if ( num_contacts === 0 ) {
          continue;
      }
      console.log("contact");
      
      var bodyA = objects[ manifold.getBody0() ];
      var bodyB = objects[ manifold.getBody1() ];

      //var bodyA =  manifold.getBody0();
      //var bodyB =  manifold.getBody1();
      //console.log(bodyA); //null
      //console.log(bodyB); //null
      //not working
      if(bodyA == sensorBody || bodyB == sensorBody){
        sensorBodyOverlapped = true;
        console.log("sensorBodyOverlapped");
      }
      //not working
      if(bodyA == body || bodyB == body){
        bodyOverlapped = true;
        console.log("bodyOverlapped");
      }
      
      /*
      // Optional:
      for (var j = 0; j < num_contacts; j++ ) {
        var pt = manifold.getContactPoint( j );
        var normalOnB = pt.get_m_normalWorldOnB();
        break;
      }
      */
    }        
    render();
  }
  // Animation loop
  function render(){
    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.scale(50, -50);
    drawCircle(ctx,body,bodyOverlapped);
    drawCircle(ctx,sensorBody,sensorBodyOverlapped);
    ctx.restore();
  }
  
  onDestroy(()=>{
    window.removeEventListener('resize', handle_auto_resize);
    unsubLogin();
  });
  
</script>
<style>
  .mainbody{
    width:100%;
    height:100%;
  }
</style>

<div id="{idcomponent}" class="mainbody">
    <div id={idnav} class="navmenu">

    </div>
    <div id={idcontent} class="content">
      <!--<div id="viewport" class="topleft" style="width:100%;height:100%;"></div>-->
      <canvas width="500" height="200" id="myCanvas"></canvas>
    </div>
</div>
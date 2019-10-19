import "../common/ammo";
import { gTrans } from "./g";
import { System } from "ecsy";
import {
  Object3D,
  PhysicsObject3D,
  Moving,
} from "./components.js";

export class Physics3DSystem extends System {

  constructor(world, attributes){
    super(world, attributes);
    this.IgnorePhysics = false;
    //this.tmpTrans = null;
    
    //console.log("init Physics3DSystem");
    /*
    if(typeof window == undefined){
      console.log(global)
    }else{
      console.log(window)
      console.log(window.Ammo$1)
      let Ammo;
      var self = this;
      Ammo = window.Ammo$1;
      Ammo().then(()=>{
        self.tmpTrans = new Ammo.btTransform();
      });
    }
    */
    //console.log(Ammo);
    //Ammo().then(()=>{
      //console.log("init ammo")
      //this.tmpTrans = new Ammo.btTransform();
      //console.log(this.tmpTrans);
    //});

    /*
    let self = this;
    onIgnorePhysics.subscribe(value => {
      console.log("TEST ENABLE:",value);
      self.IgnorePhysics = value;
    });
    */
    
  }
  execute(delta) {
    let entities = this.queries.entities.results;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      let objAmmo = entity.getComponent(PhysicsObject3D).object;
      let object = entity.getComponent(Object3D).object;
      let ms = objAmmo.getMotionState();
      if ( ms ) {
        //console.log(gTrans);
        if(gTrans ==null){
          return;
        }
        //console.log("update");
        let tmpTrans = gTrans;
        ms.getWorldTransform( tmpTrans );
        let p = tmpTrans.getOrigin();
        let q = tmpTrans.getRotation();
        //console.log(p.x(), p.y(), p.z() )
        //console.log("moving...");
        object.position.set( p.x(), p.y(), p.z() );
        object.quaternion.set( q.x(), q.y(), q.z(), q.w() );
      }
      /*
      if(!this.IgnorePhysics){
        object.position.copy(physics.getPosition());
        object.quaternion.copy(physics.getQuaternion());
      }
      */
    }
  }
}

Physics3DSystem.queries = {
  entities: { components: [PhysicsObject3D, Object3D] }
};
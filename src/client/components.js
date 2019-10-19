import { TagComponent } from "ecsy";

export class Moving extends TagComponent {}

export class Object3D {
  constructor() {
    this.object = null;
  }
  reset() {
    this.object = null;
  }
}

export class PhysicsObject3D {
  constructor() {
    this.object = null;
  }
  reset() {
    this.object = null;
  }
}
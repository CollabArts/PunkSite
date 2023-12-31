class Flock{
  constructor(_size, _pointerSize, _flockParams){
    //variables for storing and adjusting flocking options
    this.flockParams = {
      perceptionRadius: 100, //how close is considered in-flock
      maxSpeed: 50, //speed of movement
      maxForce: 0.01, //speed of change to movement
      desiredSeparation: this.pointerSize * 2, //how far apart should they want to be
      separationBias: 20, //how much they should want to be apart
      alignmentBias: 1.5, //how much they should want to move in the same direction
      cohesionBias: 0.4, //how much they should want to be close together
      seekBias: 1, //how much they should want to follow the mouse
      flockSize: 12, //quantity of pointers
      trailAmount: .1, //the transparency of the background (adds trail)
    } || _flockParams;
    
    this.flock = []; //the array of all pointers in the flock
    this.flockSize = 0; //the quantity of pointers in the flock
    this.pointerSize = _pointerSize || 15; //more or less exact size of my pointer, could fluctuate randomly

    
    
    //create the flock
    for(let i = 0; i < this.flockParams.flockSize; i++){
      let boidSize = random(this.pointerSize - 8, this.pointerSize + 8); //random size for each pointer
      let boidPos = createVector(random(0, width), random(0, height)); //storing position in a 2D Vector, TODO: use normalized (between 0-1) values for X and Y position so it scales to diff screen sizes
      let boidSpeed = random(-5, 5) + this.flockParams.maxSpeed; //slight variation in speed;

      this.flock.push(new Boid(boidSize, boidPos, boidSpeed, this.flockParams));
    }
    this.flockSize = this.flock.length;
    
  }  
  update(_mousePos){
    for (let boid of this.flock){
      boid.flock(this.flock, _mousePos);
    }

    push();
    stroke(0);
    for (let boid of this.flock){
      boid.update();
      strokeWeight(boid.size/8);
      boid.show();
      // push();
      // tint(boid.color);
      // image(pointer, boid.pos.x, boid.pos.y, boid.size, boid.size);
      // pop();
    }
    pop();
  }
}

class Boid{
  constructor(_size, _pos, _speed, _flockParams){
    this.size = _size; 
    this.pos = _pos;
    this.acc = createVector(0, 0); //acceleration
    this.vel = createVector(random(-10, 10), random(-10, 10)); //start with random direction
    this.perceptionRadius = _flockParams.perceptionRadius;
    this.maxSpeed = _speed;
    this.maxForce = _flockParams.maxForce;
    this.desiredSeparation = _flockParams.desiredSeparation;
    this.separationBias = _flockParams.separationBias;
    this.alignmentBias = _flockParams.alignmentBias;
    this.cohesionBias = _flockParams.cohesionBias;
    this.seekBias = _flockParams.seekBias;

    this.step = this.size/3; // just for drawing pointer;
    this.color = color(floor(random(0, 360)), random(150,255), random(150, 255));
  }
  
  flock(_flock, _mousePos){
    //check for alignment, separation, cohesion, plus seeking the user's mouse
    //add all changes to velocity, which will apply in update
    //will check all pointers in flock, though might get too expensive with more pointers
    let neighbors = [];
    let closest = [];
    for (let boid of _flock){
      let d = this.pos.dist(boid.pos);
      if (d <= this.perceptionRadius){
        //if the other pointer is close enough, add to the array that gets checked
        neighbors.push(boid);

        if (d <= this.perceptionRadius / 2 && closest.length < 12){
          //close enough to skew hue
          closest.push(hue(boid.color));
        }
      }
    }

    //of closest neighbors, adjust color towards median hue
    //sort hues
    if (closest.length > 0){
      closest.push(hue(this.color));
      closest.sort((a,b)=>(a-b));
      let median = closest[floor(closest.length/2)];
      let sat = saturation(this.color);
      let bri = brightness(this.color);
      // let newHue = lerpColor(this.color, color(median, sat, bri), 0.01);
      let mutation = random();
      if (mutation < 0.001){
        this.color = color(random(0,360), sat, bri);
      } else {
        this.color = lerpColor(this.color, color(median, sat, bri), 0.01);
      }
    }
    

    let separation = this.separation(neighbors);
    let alignment = this.alignment(neighbors);
    let cohesion = this.cohesion(neighbors);
    
    separation.mult(this.separationBias);
    alignment.mult(this.alignmentBias);
    cohesion.mult(this.cohesionBias);
    
    this.acc.add(separation);
    this.acc.add(alignment);
    this.acc.add(cohesion);
    
    let seek = this.seek(_mousePos);
    seek.mult(this.seekBias);
    this.acc.add(seek);
    
    this.bounds(); //keep the pointers on the screen
  }
  
  separation(_neighbors){
    let steer = createVector(0, 0);
    let count = 0;
    
    //for every boid, check to see if too close for comfort
    for (let boid of _neighbors){
      let d = this.pos.dist(boid.pos);
      if (boid != this && d < this.desiredSeparation){
        //if too close, find the vector away from them
        let diff = p5.Vector.sub(this.pos, boid.pos);
        diff.div(d * d); //makes it so that the closer they are, the stronger the force
        steer.add(diff);
        count++;
      }
    }
    
    if (count > 0){
      steer.div(count);
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    
    return steer;
  }
  
  alignment(_neighbors){
    let steer = createVector(0,0);
    let count = 0;
    
    for (let boid of _neighbors){
      if (boid != this){
        steer.add(boid.vel);
        count++;
      }
    }
    
    if (count > 0){
      steer.div(count);
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    
    return steer;
  }
  
  cohesion(_neighbors){
    let steer = createVector(0,0);
    let count = 0;
    
    for (let boid of _neighbors){
      if (boid != this){
        steer.add(boid.pos);
        count++;
      }
    }
    
    if (count > 0){
      steer.div(count);
      
      // steer.normalize();
      // steer.mult(this.maxSpeed);
      // steer.sub(this.vel);
      // steer.mult(this.maxForce);
    }
    
    // return steer;
    return this.seek(steer);
  }
  
  seek(_mousePos){
    let mousePos = _mousePos.copy();
    let steer = mousePos.sub(this.pos);
    steer.normalize();
    steer.mult(this.maxSpeed);
    steer.sub(this.vel);
    steer.mult(this.maxForce);
    
    return steer;
  }
  
  bounds(){
    if (this.pos.x > width - (this.size*2)) {this.acc.add(createVector(-1, 0))}
    if (this.pos.x < (this.size*2)) {this.acc.add(createVector(1, 0))}
    if (this.pos.y > height - (this.size*2)) {this.acc.add(createVector(0, -1))}
    if (this.pos.y < (this.size*2)) {this.acc.add(createVector(0, 1))}
  }
  
  update(){
    this.pos.add(this.vel); //move the boid
    this.vel.add(this.acc); //add the current forces to velocity
    this.vel.limit(this.maxSpeed); //make sure we're not going too fast
    this.acc.mult(0); //reset the forces for the next flock loop
  }

  show(){
    //drawing pointer manually now because tint is too crazy, have to use fill
    let step = this.step;
    let x = this.pos.x;
    let y = this.pos.y;
    push();
    // fill(0, 0, 255);
    fill(this.color);
    beginShape();
    vertex(x - (step / 3), y); // 1
    vertex(x + (step / 3), y + (step * 1.75)); // 2
    vertex(x - (step / 3), y + (step * 2)); // 3
    vertex(x - step, y + (step / 3)); // 4
    vertex(x - (step * 2), y + step); // 5
    vertex(x - (step * 2), y - (step * 3)); // 6
    vertex(x + step, y); // 7
    endShape(CLOSE);
    pop();
  }
}

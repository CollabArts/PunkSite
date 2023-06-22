class Button{
  constructor(_label, _shape, _size, _pos, _color){
    this.label = _label; //{"text", font, size}
    this.label.rot = 0;
    this.color = _color;
    this.shape = _shape;
    this.vertices = [];
    this.size = _size;
    this.r = _size / 2;
    this.pos = _pos;
    // this.isWiggling = true;

    if (this.shape == "triangle"){
      this.vertices = [
        this.pos.x + this.r, this.pos.y + this.r,
        this.pos.x - this.r, this.pos.y + this.r,
        this.pos.x,          this.pos.y - this.r
      ];
    }
  }

  checkBounds(x, y){
    let mousePos = createVector(x, y);
    if (mousePos.dist(this.pos) < this.r){
      //in range to click
      this.clicked();
    }
  }

  checkHover(x, y){
    //if not hovering over, wiggle
    let mousePos = createVector(x, y);
    if (mousePos.dist(this.pos) >= this.r){
      this.wiggle();
    }
  }

  wiggle(){
    for (let i = 0; i < this.vertices.length; i++){
      this.vertices[i] += random(-2, 2);
    }
    // this.label.size += random(-1,1);
    this.label.rot += random(-0.01, 0.01);
  }

  update(){
    push();
    fill(this.color);
    if (this.shape == "triangle"){
      beginShape();
      vertex(this.vertices[0],this.vertices[1]);
      vertex(this.vertices[2],this.vertices[3]);
      vertex(this.vertices[4],this.vertices[5]);
      endShape(CLOSE);
    }
    pop();
    push();
    translate(this.pos.x,this.pos.y);
    rotate(this.label.rot);
    fill(0);
    textFont(this.label.font);
    textSize(this.label.size);
    text(this.label.text, 0, 0);
    pop();
  }

  clicked(){
    this.color = color(random(0, 360), 255, 255);
    window.open("https://tisch.nyu.edu/collaborative-arts/Students");
  }
}

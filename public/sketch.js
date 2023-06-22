/*
    ~ * ~ * ~ * 
    CLIENT
    ~ * ~ * ~ * 
*/

//
//  VARIABLES
//

let flock; //holds the stuff flying around the mouse/screen
let title; //holds all the characters in the title
let button; //reference to the triangle button

//
//  ASSET LOAD
//

let pointer; //the image of the mouse pointer
let clouds; //the loaded background image
let cloudColor; //stores the color we're tinting the clouds
let fonts = []; // the array of custom fonts
let fontSize;
let akronim, cherrybomb, eater, griffy, kablammo, mochiy, pressstart, rock3D, rubikIso, rubikMoonrocks, rubikPuddles; //the references to the custom fonts getting loaded

function preload() {
  pointer = loadImage("assets/images/pointer.png");
  clouds = loadImage("assets/images/clouds.jpg");
  akronim= loadFont("assets/fonts/Akronim-Regular.ttf");
  cherrybomb= loadFont("assets/fonts/CherryBombOne-Regular.ttf");
  eater= loadFont("assets/fonts/Eater-Regular.ttf");
  griffy= loadFont("assets/fonts/Griffy-Regular.ttf");
  kablammo= loadFont("assets/fonts/Kablammo-Regular.ttf");
  mochiy= loadFont("assets/fonts/MochiyPopOne-Regular.ttf");
  pressstart= loadFont("assets/fonts/PressStart2P-Regular.ttf");
  rock3D= loadFont("assets/fonts/Rock3D-Regular.ttf");
  rubikIso= loadFont("assets/fonts/RubikIso-Regular.ttf");
  rubikMoonrocks= loadFont("assets/fonts/RubikMoonrocks-Regular.ttf");
  rubikPuddles = loadFont("assets/fonts/RubikPuddles-Regular.ttf");
  
  fonts.push(akronim, cherrybomb, eater, griffy, kablammo, mochiy, pressstart, rock3D, rubikIso, rubikMoonrocks, rubikPuddles);
}

//
//  MAIN
//

function setup(){
  createCanvas(windowWidth, windowHeight); //TODO better way of ensuring scrollbars don't show up
  
  //layout
  imageMode(CENTER); //draws the image from center coordinates instead of corner
  angleMode(RADIANS);
  textAlign(CENTER, CENTER); //aligns the text to the center horizontally, and to the bottom vertically
  // textFont(font);
  noStroke();//removes the outline so the text isn't as thick
  colorMode(HSB);
  
  //font scale 
  fontSize = width/8;
  textSize(fontSize); 
  
  //create flock array
  flock = new Flock();
  
  //set cloud tint
  cloudColor = color("#93a808"); //idk i love this color
  cloudColor.setAlpha(flock.flockParams.trailAmount); //adding transparency so we get some pointer trails when draw() loops
  
  //setup the title characters
  let titles = ["COLLAB", "ARTS"];
  title = new Title(titles, fonts, fontSize);

  //setup the triangle button
  let label = {
    text: "CLICK ME!",
    font: kablammo,
    size: fontSize / 5
  }

  let buttonPos = createVector(width/2, 4*height/5);
  let buttonColor = color("#fc85cc");
  button = new Button(label, "triangle", width/5, buttonPos, buttonColor);
} 

//
//  FUNCTIONS
//

function draw() {
  // background("#93a808"); //not using background
  push(); //isolates the changes to just whatever comes before pop()
  tint(cloudColor);
  image(clouds, width/2, height/2, width, height); //using half the value of the dimensions because we're drawing the image from the center of the image, not the corner
  pop();
  image(pointer, mouseX + 3, mouseY + 5, flock.pointerSize, flock.pointerSize); //so we get a trail of our own pointer, size a little off rn
  
  //shape button updates
  button.checkHover(mouseX, mouseY);
  button.update();

  //have the pointers look at the flock and the mouse, update each pointer, and then draw each pointer
  let mousePos = createVector(mouseX, mouseY);
  flock.update(mousePos);
  
  //text updates
  title.update();
}

//
//  MOUSE FUNCTIONS
//

function mousePressed(){
  button.checkBounds(mouseX, mouseY);
}

//
//  SHOW FUNCTIONS
//


//
//  MISC FUNCTIONS
//

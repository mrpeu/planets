

//----------
// utils

// src: https://github.com/soulwire/sketch.js/blob/master/js/sketch.js
function random( min, max ) {
  if ( Object.prototype.toString.call( min ) == '[object Array]' )
    return min[~~( Math.random() * min.length )];
  if ( typeof max != 'number' )
    max = min || 1, min = 0;
  return min + Math.random() * ( max - min );
}
function extend( target, source, overwrite ) {
  for ( var key in source )
    if ( overwrite || !target.hasOwnProperty( key ) )
      target[key] = source[key];
  return target;
}

// src: Paul Irish obv
window.requestAnimFrame = ( function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
      window.setTimeout( callback, 1000 / 60 );
    };
} )();

// src: http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
function makeTextSprite( param ) {

  var makeText = function ( parameters ) {
    if ( parameters === undefined ) parameters = {};

    this.label = this.label || {};

    var text = parameters.text || this.label.text;

    var fontface = parameters.fontface || this.label.fontface || "Arial";

    var fontsize = parameters.fontsize || this.label.fontsize || 18;

    var fontColor = parameters.fontColor || this.label.fontColor || new THREE.Color( 0 );

    var borderThickness = parameters.borderThickness || this.label.borderThickness || 4;

    var borderColor = parameters.borderColor || this.label.borderColor || new THREE.Color( 0 );

    var backgroundColor = parameters.backgroundColor || this.label.backgroundColor || new THREE.Color( 0xFFFFFF );

    var spriteAlignment = THREE.SpriteAlignment.topLeft;

    var canvas = document.createElement( 'canvas' );
    var context = canvas.getContext( '2d' );
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText( text );
    var textWidth = metrics.width;

    // background color
    context.fillStyle = backgroundColor.getStyle();
    // border color
    context.strokeStyle = borderColor.getStyle();

    context.lineWidth = borderThickness;

    var roundRect = function ( ctx, x, y, w, h, r ) {
      ctx.beginPath();
      ctx.moveTo( x + r, y );
      ctx.lineTo( x + w - r, y );
      ctx.quadraticCurveTo( x + w, y, x + w, y + r );
      ctx.lineTo( x + w, y + h - r );
      ctx.quadraticCurveTo( x + w, y + h, x + w - r, y + h );
      ctx.lineTo( x + r, y + h );
      ctx.quadraticCurveTo( x, y + h, x, y + h - r );
      ctx.lineTo( x, y + r );
      ctx.quadraticCurveTo( x, y, x + r, y );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    roundRect( context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6 );
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = fontColor.getStyle();

    context.fillText( text, borderThickness, fontsize + borderThickness );

    // canvas contents will be used for a texture
    var texture = new THREE.Texture( canvas )
    texture.needsUpdate = true;

    this.material = new THREE.SpriteMaterial(
      { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );

    extend( this.label, {
      text: text,
      fontface: fontface, fontsize: fontsize, fontColor: fontColor,
      borderThickness: borderThickness, borderColor: borderColor,
      backgroundColor: backgroundColor
    } );
  };

  var sprite = new THREE.Sprite();

  makeText.call( sprite, param );

  sprite.makeText = makeText.bind( sprite );

  sprite.scale.set( 100, 50, 1.0 );

  return sprite;
}




Game = function ( container ) {

  var Colors = {
    "red": 0xFF4444,
    "green": 0x77FF55,
    "blue": 0x0CCFFF,
    "yellow": 0xEEEE11,
    "brown": 0xCD853F,
    "white": 0xFFFFFF
  };

  var Materials = {
    default: new THREE.MeshLambertMaterial( { color: Colors.white, wireframe: true } ),

    white: new THREE.MeshLambertMaterial( { color: Colors.white, wireframe: false, shading: THREE.FlatShading } ),
    red: new THREE.MeshLambertMaterial( { color: Colors.red, wireframe: false, shading: THREE.FlatShading } ),
    green: new THREE.MeshLambertMaterial( { color: Colors.green, wireframe: false, shading: THREE.FlatShading } ),
    blue: new THREE.MeshLambertMaterial( { color: Colors.blue, wireframe: false, shading: THREE.FlatShading } ),
    yellow: new THREE.MeshLambertMaterial( { color: Colors.yellow, wireframe: false, shading: THREE.FlatShading } ),
    brown: new THREE.MeshLambertMaterial( { color: Colors.brown, wireframe: false, shading: THREE.FlatShading } ),

    home: new THREE.MeshLambertMaterial( { color: Colors.green, wireframe: false, shading: THREE.FlatShading } )
    //home: new THREE.ShaderMaterial(
    //  {
    //    uniforms:
    //    {
    //    },
    //    vertexShader: document.getElementById( 'vsHome' ).textContent,
    //    fragmentShader: document.getElementById( 'fsHome' ).textContent,
    //    side: THREE.BackSide,
    //    blending: THREE.AdditiveBlending,
    //    transparent: true
    //  }
    //)
  };


  /**********************
   *
   *
   *        Planet
   *
   *
   **********************/

  var Planet = function ( param ) {
    param = param || {};

    this.mouseable = param.mouseable || true;
    //radius
    this.radius = param.radius || random( 7, 15 );
    // speed
    this.sx = param.sx || random( -0.5, 0.5 );
    this.sy = param.sy || random( -0.5, 0.5 );
    // acceleration
    this.ax = param.ax || 0.0;
    this.ay = param.ay || 0.0;
    // rotation
    this.rx = param.rx || random( -0.01, 0.008 );
    this.ry = param.ry || random( -0.01, 0.008 );
    // rotation speed
    this.rsx = param.rsx || random( -0.01, 0.01 );
    this.rsy = param.rsy || random( -0.01, 0.01 );
    // nb segments of the sphere geometry
    this.segW = param.segW || random( 5, 10 );
    this.segH = param.segH || random( 5, 10 );

    if ( param.material === undefined || !(param.material instanceof THREE.Material) ) {
      param.material = Materials.white;
    }

    this.material = param.material;

    var geometry = new THREE.SphereGeometry( this.radius, this.segW, this.segH );
    geometry.mergeVertices();

    this.mesh = new THREE.Mesh( geometry, this.material );

    this.mesh.position.x = param.x || 0;
    this.mesh.position.y = param.y || 0;

    this.mesh.rotation.x = param.rx || 0;
    this.mesh.rotation.y = param.ry || 0;

    this.mesh.glowMesh = this.initGlow( this.mesh );

    this.knead( param.knead || .5 );

    this.id = this.mesh.id = Planet.prototype.id++;

    this.mesh.name = "Planet" + this.id;
    this.mesh.glowMesh.name = this.mesh.name + "-" + "glowMesh";


    var font = new THREE.Color( 0xFFFFFF ),
        border = this.material.color.clone().offsetHSL( 0, 0, 0.1 ),
        back = this.material.color.clone().offsetHSL( 0, 0, -0.3 )
    ;
    this.label = makeTextSprite(
      {
        fontsize: 24,
        fontColor: font,
        borderColor: border,
        backgroundColor: back,
        text: "init"
      }
    );
    this.label.position.x = this.radius;
    this.mesh.add( this.label );

  };

  Planet.prototype.id = 0;

  Planet.prototype.links = [];

  Planet.prototype.initGlow = function ( mesh ) {

    var matGlow = new THREE.ShaderMaterial(
      {
        uniforms:
        {
          glowColor: { type: "v3", value: mesh.material.color },
          power: { type: "f", value: 1 }
        },
        vertexShader: document.getElementById( 'vsGlow' ).textContent,
        fragmentShader: document.getElementById( 'fsGlow' ).textContent,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      }
    );
    var geom = new THREE.SphereGeometry( mesh.geometry.radius, 30, 30 );
    //var geom = mesh.geometry.clone();

    var glowMesh = new THREE.Mesh( geom, matGlow );
    glowMesh.scale.x = glowMesh.scale.y = glowMesh.scale.z = 1.5;
    glowMesh.visible = false;

    mesh.add( glowMesh );

    return glowMesh;
  };

  Planet.prototype.update = function ( ctx ) {

    if ( this.free ) {

      this.mesh.position.x += this.sx;
      this.mesh.position.y += this.sy;

      this.sx += this.ax;
      this.sy += this.ay;
    }

    this.mesh.rotation.x += this.rsx;
    this.mesh.rotation.y += this.rsy;

    this.links.forEach( function(link){ link.update( ctx ); } );
  };

  Planet.prototype.knead = function ( min, max ) {
    // rq: careful this is in not correct and only work for a planet at the origin

    if ( min === undefined ) return;

    if ( max === undefined ) {
      var d = min / 2;
      max = 1 + d;
      min = 1 - d;
    }

    var r = this.radius / 10;

    this.mesh.geometry.vertices.forEach( function ( v ) {

      v.multiplyScalar( random( min, max ) );

      v[random( ['x', 'y', 'z'] )] += random( r );

    }, this.mesh );
  };

  Planet.prototype.onClick = function( ctx, e ) {

    console.log( "Planet#" + this.id + " onClick( " + game + ", " + e + " );" );

  };


  var PlanetYellow = function ( param ) {

    param = param || {};
    param.material = param.material || Materials.yellow;

    Planet.call( this, param );
  };

  PlanetYellow.prototype = Object.create( Planet.prototype );


  var PlanetBlue = function ( param ) {

    param = param || {};
    param.material = param.material || Materials.blue;

    Planet.call( this, param );
  };

  PlanetBlue.prototype = Object.create( Planet.prototype );


  var PlanetRed = function ( param ) {

    param = param || {};
    param.material = param.material || Materials.red;

    Planet.call( this, param );
  };

  PlanetRed.prototype = Object.create( Planet.prototype );

  

  /**********************
   *
   *
   *        Link
   *
   *
   **********************/


  var Link = function ( param ) {
    
    param = param || {};
    this.id = Link.prototype.id++;
  };

  Link.prototype.id = 0;

  Link.prototype.update = function ( ctx ) {
    /*
    var axis, radians;

    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    this.matrix.multiplySelf(rotObjectMatrix);

    this.rotation.setEulerFromRotationMatrix(this.matrix);
    */
  };


  var LinkCurves = function ( param ) {

    if ( typeof param === "undefined" || param.source === undefined || param.target === undefined )
      return;

    Link.call( this, param );

    this.source = param.source;
    this.target = param.target;

    this.material = param.material || Materials.default;

    var getControlPoints = function ( p0, p1, nbSeg) {
      var pts = [],
        cursor = p0.clone(),
        n = p1.clone().sub( p0 ).divideScalar( nbSeg )
      ;
    
      pts.push( p0 );

      for ( var i = nbSeg - 1; i > 1; i-- ) {

        cursor.add( n );

        pts.push( cursor.clone() );

      }

      pts.push( p1.clone() );

      return pts;
    }

    var getNoisePoints = function( controlPoints, amount ){
      var pts = [], pt,
        l = controlPoints.length - 2,
        halfAmount = amount / 2
      ;

      pts.push(controlPoints[l+1]);

      for ( var i = l; i > 1; i-- ) {

        pt = controlPoints[i];

        pts.push( new THREE.Vector3(
          pt.x,
          pt.y + random( amount ) - halfAmount,
          pt.z + random( amount ) - halfAmount
        ));
      }

      pts.push(controlPoints[0]);

      return pts; 
    }

    var p0 = this.source.position,
        p1 = this.target.position,
        distance = p0.distanceTo( p1 ),
        ctrlPts,
        nbCtrlPts = Math.round( distance / 30 ),
        nbSeg = nbCtrlPts * 5, radiusSeg = 3,
        noiseAmount = 20
    ;

    ctrlPts = getControlPoints( p0, p1, nbCtrlPts );

    var geometry =
      new THREE.TubeGeometry(
        new THREE.SplineCurve3(
          getNoisePoints( ctrlPts, noiseAmount )
        ), nbSeg, 2, radiusSeg, false
    );

    THREE.GeometryUtils.merge( geometry,
      new THREE.TubeGeometry(
        new THREE.SplineCurve3(
          getNoisePoints( ctrlPts, noiseAmount )
        ), nbSeg, 2, radiusSeg, false
      )
    );

    this.mesh = new THREE.Mesh(
      geometry,
      this.material
    );
  };

  LinkCurves.prototype = Object.create( Link.prototype );

  

  /**********************
   *
   *
   *        Game
   *
   *
   **********************/


  // vars for mouseMove
  var ray = new THREE.Raycaster();
  var projector = new THREE.Projector();
  var directionVector = new THREE.Vector3();
  var starsHovered = []; // id of the star currently hovered

  var mouseMove = function ( e ) {

    var x = e.clientX - this.CANVAS_WIDTH / 2,
        y = -e.clientY + this.CANVAS_HEIGHT / 2,
        mouseVec3 = new THREE.Vector3( x, y, 0 ),
        _starsHovered = starsHovered, starId,
        star, d, r
    ;

    for ( i in this.stars ) {
      star = this.stars[i];
      starId = star.id;
      d = star.mesh.position.distanceTo( mouseVec3 );
      r = star.mesh.geometry.boundingSphere.radius;

      star.label.makeText( { text: Math.round(d) } );
      //if(i==0) console.log(d + " << " + JSON.stringify(mouseVec3) );

      if ( d < r ) {
        starsHovered.push( star.id );
        star.mesh.glowMesh.visible = true;
      }
    }

    if ( _starsHovered.length > 0 )
      for ( i in this.stars ) {
        star = this.stars[i];

        for ( j in _starsHovered ) {
          starId = _starsHovered[j];

          if ( star.id == starId )
            if ( starsHovered.indexOf( star.id ) < 0 ) {
              star.mesh.glowMesh.visible = false;
              break;
            }
        }
      }

  };

  var mouseWheel = function ( e ) {
    this.camera.fov -= e.wheelDelta / 10;

    this.camera.updateProjectionMatrix();
  };


  var resizeContainer = function () {

    this.CANVAS_WIDTH = window.innerWidth - 5;
    this.CANVAS_HEIGHT = window.innerHeight - 5;

    this.renderer.setSize( this.CANVAS_WIDTH, this.CANVAS_HEIGHT );

    this.camera.left = this.CANVAS_WIDTH / -2;
    this.camera.right = this.CANVAS_WIDTH / 2;
    this.camera.top = this.CANVAS_HEIGHT / 2;
    this.camera.bottom = this.CANVAS_HEIGHT / -2;

    this.camera.aspect = this.CANVAS_WIDTH / this.CANVAS_HEIGHT;

    this.camera.updateProjectionMatrix();
  };

  Game.prototype.update = function ( ctx ) {

    for ( var i = this.stars.length - 1; i >= 0; i-- ) {
      this.stars[i].update( ctx );
    }

  };

  Game.prototype.render = function () {

    window.requestAnimFrame( this.render.bind( this ) );

    this.update( this );

    this.renderer.render( this.scene, this.camera );

  };


  /**********
   * Init
   */

  this.map = [{
    name: "0",
    home: new Planet( {
      radius: 50,
      rx: random( 1 ), ry: random( 1 ),
      //rsx: random( .05 ), rsy: random( .05 ),
      //material: "home",
      rsx: Number.MIN_VALUE, rsy: Number.MIN_VALUE,
      material: Materials.home,
      segW: 12, segH: 8, knead: .5
    } ),
    planets: [
      new PlanetRed( { x: -150, y: 150 } ),
      new PlanetRed( { x: 200, y: 20 } ),
      new PlanetYellow( { x: -200, y: -200 } ),
      new PlanetYellow( { x: 150, y: 200 } ),
      new PlanetBlue( { x: 500, y: -250 } ),
      new PlanetBlue( { x: -500, y: 100 } )
    ]
  }];

  this.container = container || document.body;//getElementById("container")

  this.currentMapIndex = 0;

  //this.CANVAS_WIDTH = 640, this.CANVAS_HEIGHT = 480;
  this.CANVAS_WIDTH = window.innerWidth - 5;
  this.CANVAS_HEIGHT = window.innerHeight - 5;
  //this.CANVAS_WIDTH = container.clientWidth;
  //this.CANVAS_HEIGHT = container.clientHeight;
  
  this.renderer = new THREE.WebGLRenderer();

  this.renderer.setSize( this.CANVAS_WIDTH, this.CANVAS_HEIGHT );

  this.container.appendChild( this.renderer.domElement );

  this.scene = new THREE.Scene();
  
  this.stars = [];
  
  var currentMap = this.map[this.currentMapIndex];

  // create home
  this.home = currentMap.home;
  
  this.scene.add( this.home.mesh );

  //console.log("Created " + p.mesh.name + " #" + p.id + ". proto=#" + Planet.prototype.id);

  // create satellites
  for ( var i = currentMap.planets.length - 1; i >= 0; i-- ) {

    p = currentMap.planets[i];

    this.stars.push( p );

    this.scene.add( p.mesh );

    //console.log("Created " + p.mesh.name + " #" + p.id + ". proto=#" + Planet.prototype.id);

  };

  /*
    // set a hemisphere light
    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xdddddd, .6 );
    scene.add( hemiLight );
  */
  /*
    // set a directional light
    var directionalLight = new THREE.DirectionalLight( 0xdddddd, 1 );
    directionalLight.position.z = 1000;
    directionalLight.name = "directionalLight";
    scene.add( directionalLight );
  */

  // set point lights
  var lightZ = 500, lightXY = 250, lightColor = Colors.white, lightIntensity = .4, lightDistance = undefined;

  var pointLight0 = new THREE.PointLight( lightColor, lightIntensity, lightDistance );
  pointLight0.position.set( -lightXY, lightXY, lightZ );
  pointLight0.name = "pointLight0";
  this.scene.add( pointLight0 );

  var pointLight1 = new THREE.PointLight( lightColor, lightIntensity, lightDistance );
  pointLight1.position.set( lightXY, lightXY, lightZ );
  pointLight1.name = "pointLight0";
  this.scene.add( pointLight1 );
  var pointLight2 = new THREE.PointLight( lightColor, lightIntensity, lightDistance );
  pointLight2.position.set( lightXY, -lightXY, lightZ );
  pointLight2.name = "pointLight0";
  this.scene.add( pointLight2 );
  var pointLight3 = new THREE.PointLight( lightColor, lightIntensity, lightDistance );
  pointLight3.position.set( -lightXY, -lightXY, lightZ );
  pointLight3.name = "pointLight3";
  this.scene.add( pointLight3 );

  /*
  var ambientLight = new THREE.AmbientLight( 0x444444 );
  ambientLight.name = "ambientLight";
  scene.add(ambientLight);
  */

  window.addEventListener( 'resize', resizeContainer.bind( this ) );

  window.addEventListener( 'mousewheel', mouseWheel.bind( this ) );

  this.container.addEventListener( 'mousemove', mouseMove.bind( this ) );


  var width = this.CANVAS_WIDTH,
      height = this.CANVAS_HEIGHT;

  //this.camera = new THREE.OrthographicCamera( width / -2, width / 2, height / 2, height / -2, -100, 600 );
  this.camera = new THREE.PerspectiveCamera( 80, width / height, 1, 600 );
  this.camera.position.z = 500;






  /**************
   * TEST volumetric curves
   */
  
  var target = this.stars[Math.round( random( 1, this.stars.length - 1 ) )].mesh;

  var linkTest = new LinkCurves(
    {
      source: this.home.mesh,
      target: target,
      material: target.material
    }
  );

  this.scene.add( linkTest.mesh );

  /**************/
};



var game;

try {
  game = new Game();
}
catch ( error ) {
  nogl = document.getElementById( "nogl" );
  nogl.innerHTML += "<h2>" + error.message + "</h2>";
  nogl.innerHTML += "<p>" + error.stack + "</p>";
  nogl.style.display = 'block';
}

if ( window.game !== undefined )
  game.render();








// next step: http://stemkoski.github.io/Three.js/Mouse-Over.html
// or http://yomotsu.github.io/threejs-examples/ray_basic/
// http://www.89a.co.uk/page/14
// http://mrdoob.github.io/three.js/examples/canvas_lines.html

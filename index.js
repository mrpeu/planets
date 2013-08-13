

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

    sprite.visible = true;
  };

  var sprite = new THREE.Sprite();

  makeText.call( sprite, param );

  sprite.makeText = makeText.bind( sprite );

  sprite.scale.set( 100, 50, 1.0 );

  sprite.visible = false;

  return sprite;
}


window.mouse = { x: 0, y: 0 };


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


// src: http://patorjk.com/software/taag/#p=display&v=2&f=Doh&t=Game

/**********************************************************************************************************
                                                                                   
        GGGGGGGGGGGGG                                                              
     GGG::::::::::::G                                                              
   GG:::::::::::::::G                                                              
  G:::::GGGGGGGG::::G                                                              
 G:::::G       GGGGGG  aaaaaaaaaaaaa      mmmmmmm    mmmmmmm       eeeeeeeeeeee    
G:::::G                a::::::::::::a   mm:::::::m  m:::::::mm   ee::::::::::::ee  
G:::::G                aaaaaaaaa:::::a m::::::::::mm::::::::::m e::::::eeeee:::::ee
G:::::G    GGGGGGGGGG           a::::a m::::::::::::::::::::::me::::::e     e:::::e
G:::::G    G::::::::G    aaaaaaa:::::a m:::::mmm::::::mmm:::::me:::::::eeeee::::::e
G:::::G    GGGGG::::G  aa::::::::::::a m::::m   m::::m   m::::me:::::::::::::::::e 
G:::::G        G::::G a::::aaaa::::::a m::::m   m::::m   m::::me::::::eeeeeeeeeee  
 G:::::G       G::::Ga::::a    a:::::a m::::m   m::::m   m::::me:::::::e           
  G:::::GGGGGGGG::::Ga::::a    a:::::a m::::m   m::::m   m::::me::::::::e          
   GG:::::::::::::::Ga:::::aaaa::::::a m::::m   m::::m   m::::m e::::::::eeeeeeee  
     GGG::::::GGG:::G a::::::::::aa:::am::::m   m::::m   m::::m  ee:::::::::::::e  
        GGGGGG   GGGG  aaaaaaaaaa  aaaammmmmm   mmmmmm   mmmmmm    eeeeeeeeeeeeee  

*/

  var mouseMove = function ( e ) {
    mouse.x = ( event.clientX / this.CANVAS_WIDTH ) * 2 - 1;
    mouse.y = -( event.clientY / this.CANVAS_HEIGHT ) * 2 + 1;
  }

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


  // vars for mouseMove
  var ray = new THREE.Raycaster();
  var projector = new THREE.Projector();
  var directionVector = new THREE.Vector3();

  Game.prototype.processMousePosition = function () {

    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)
    directionVector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( directionVector, this.camera );
    ray = new THREE.Raycaster( this.camera.position, directionVector.sub( this.camera.position ).normalize() );

    // create an array containing all objects in the scene with which the ray intersects
    this.mouse.intersects = ray.intersectObjects( this.scene.children );

    this.mouse.planetIdHovered = [];

    this.mouse.intersects.forEach( function ( intersection ) {
      if ( intersection.object.planetId !== undefined ) { // Game.Planet.mesh has a planetId field
        this.mouse.planetIdHovered.push( intersection.object.planetId );
      }
    }, this );




    /**********
     * TEST
     */
    if ( this.rayHelper.vOffsets == undefined ) {
      this.rayHelper.vOffsets = this.rayHelper.geometry.vertices.slice( 3, 6 );
    }

    var rayOrigin = ray.ray.origin.clone();

    var step = ray.ray.direction.clone().multiplyScalar( 5 );
    var newTarget = rayOrigin.add( step );
    while ( newTarget.z > 0 ) { newTarget.add( step ); }

    this.rayHelper.geometry.vertices[3] = newTarget.clone().add( this.rayHelper.vOffsets[0] );
    this.rayHelper.geometry.vertices[4] = newTarget.clone().add( this.rayHelper.vOffsets[1] );
    this.rayHelper.geometry.vertices[5] = newTarget.clone().add( this.rayHelper.vOffsets[2] );

    this.rayHelper.geometry.verticesNeedUpdate = true;

  };

  Game.prototype.update = function () {

    if ( mouse.x != this.mouse.x || mouse.y != this.mouse.y ) {
      this.mouse.x = mouse.x;
      this.mouse.y = mouse.y;
      this.processMousePosition();
    }

    for ( var i = this.stars.length - 1; i >= 0; i-- ) {
      this.stars[i].update( this );
    }

  };

  Game.prototype.render = function () {

    window.requestAnimFrame( this.render.bind( this ) );

    this.update();

    this.renderer.render( this.scene, this.camera );

  };



/**********************************************************************************************************
                                                                                                          
PPPPPPPPPPPPPPPPP   lllllll                                                                 tttt          
P::::::::::::::::P  l:::::l                                                              ttt:::t          
P::::::PPPPPP:::::P l:::::l                                                              t:::::t          
PP:::::P     P:::::Pl:::::l                                                              t:::::t          
  P::::P     P:::::P l::::l   aaaaaaaaaaaaa  nnnn  nnnnnnnn        eeeeeeeeeeee    ttttttt:::::ttttttt    
  P::::P     P:::::P l::::l   a::::::::::::a n:::nn::::::::nn    ee::::::::::::ee  t:::::::::::::::::t    
  P::::PPPPPP:::::P  l::::l   aaaaaaaaa:::::an::::::::::::::nn  e::::::eeeee:::::eet:::::::::::::::::t    
  P:::::::::::::PP   l::::l            a::::ann:::::::::::::::ne::::::e     e:::::etttttt:::::::tttttt    
  P::::PPPPPPPPP     l::::l     aaaaaaa:::::a  n:::::nnnn:::::ne:::::::eeeee::::::e      t:::::t          
  P::::P             l::::l   aa::::::::::::a  n::::n    n::::ne:::::::::::::::::e       t:::::t          
  P::::P             l::::l  a::::aaaa::::::a  n::::n    n::::ne::::::eeeeeeeeeee        t:::::t          
  P::::P             l::::l a::::a    a:::::a  n::::n    n::::ne:::::::e                 t:::::t    tttttt
PP::::::PP          l::::::la::::a    a:::::a  n::::n    n::::ne::::::::e                t::::::tttt:::::t
P::::::::P          l::::::la:::::aaaa::::::a  n::::n    n::::n e::::::::eeeeeeee        tt::::::::::::::t
P::::::::P          l::::::l a::::::::::aa:::a n::::n    n::::n  ee:::::::::::::e          tt:::::::::::tt
PPPPPPPPPP          llllllll  aaaaaaaaaa  aaaa nnnnnn    nnnnnn    eeeeeeeeeeeeee            ttttttttttt  
                                                                                                          
*/

  Game.Planet = function ( param ) {
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

    if ( param.material === undefined || !( param.material instanceof THREE.Material ) ) {
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

    this.planetId = this.mesh.planetId = Game.Planet.prototype.planetId++;

    this.mesh.name = "Planet" + this.planetId;
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

    this.mesh.add( this.label );

  };

  Game.Planet.prototype.planetId = 0;

  Game.Planet.prototype.links = [];

  Game.Planet.prototype.initGlow = function ( mesh ) {

    //var mat = new THREE.ShaderMaterial(
    //  {
    //    uniforms:
    //    {
    //      glowColor: { type: "v3", value: mesh.material.color },
    //      power: { type: "f", value: 1 }
    //    },
    //    vertexShader: document.getElementById( 'vsGlow' ).textContent,
    //    fragmentShader: document.getElementById( 'fsGlow' ).textContent,
    //    side: THREE.BackSide,
    //    blending: THREE.AdditiveBlending,
    //    transparent: true
    //  }
    //);
    var mat = new THREE.MeshLambertMaterial( { color: Colors.white, transparent: true, opacity: 0.5, side: THREE.BackSide } );
    var geom = new THREE.SphereGeometry( mesh.geometry.radius, 30, 30 );

    var glowMesh = new THREE.Mesh( geom, mat );
    glowMesh.scale.x = glowMesh.scale.y = glowMesh.scale.z = 1.5;
    glowMesh.visible = false;

    mesh.add( glowMesh );

    return glowMesh;
  };

  Game.Planet.prototype.update = function ( ctx ) {

    if ( this.free ) {

      this.mesh.position.x += this.sx;
      this.mesh.position.y += this.sy;

      this.sx += this.ax;
      this.sy += this.ay;
    }

    this.mesh.rotation.x += this.rsx;
    this.mesh.rotation.y += this.rsy;

    if ( ctx.mouse.planetIdHovered.indexOf( this.planetId ) >= 0 ) {
      this.mesh.glowMesh.visible = true;

      //this.mouse.intersects.every( function ( o ) {
      //  if ( o.object.planetId == this.id ) {

      //    return false;
      //  }
      //  return true;
      //} );
    }
    else {
      this.mesh.glowMesh.visible = false;
    }

    this.links.forEach( function ( link ) { link.update( ctx ); } );
  };

  Game.Planet.prototype.knead = function ( min, max ) {
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

  Game.Planet.prototype.onClick = function ( ctx, e ) {

    console.log( "Planet#" + this.id + " onClick( " + game + ", " + e + " );" );

  };


  Game.PlanetYellow = function ( param ) {

    param = param || {};
    param.material = param.material || Materials.yellow;

    Game.Planet.call( this, param );
  };
  Game.PlanetYellow.prototype = Object.create( Game.Planet.prototype );


  Game.PlanetBlue = function ( param ) {

    param = param || {};
    param.material = param.material || Materials.blue;

    Game.Planet.call( this, param );
  };
  Game.PlanetBlue.prototype = Object.create( Game.Planet.prototype );

  Game.PlanetRed = function ( param ) {

    param = param || {};
    param.material = param.material || Materials.red;

    Game.Planet.call( this, param );
  };
  Game.PlanetRed.prototype = Object.create( Game.Planet.prototype );



/**********************************************************************************************************

LLLLLLLLLLL               iiii                   kkkkkkkk           
L:::::::::L              i::::i                  k::::::k           
L:::::::::L               iiii                   k::::::k           
LL:::::::LL                                      k::::::k           
  L:::::L               iiiiiiinnnn  nnnnnnnn     k:::::k    kkkkkkk
  L:::::L               i:::::in:::nn::::::::nn   k:::::k   k:::::k 
  L:::::L                i::::in::::::::::::::nn  k:::::k  k:::::k  
  L:::::L                i::::inn:::::::::::::::n k:::::k k:::::k   
  L:::::L                i::::i  n:::::nnnn:::::n k::::::k:::::k    
  L:::::L                i::::i  n::::n    n::::n k:::::::::::k     
  L:::::L                i::::i  n::::n    n::::n k:::::::::::k     
  L:::::L         LLLLLL i::::i  n::::n    n::::n k::::::k:::::k    
LL:::::::LLLLLLLLL:::::Li::::::i n::::n    n::::nk::::::k k:::::k   
L::::::::::::::::::::::Li::::::i n::::n    n::::nk::::::k  k:::::k  
L::::::::::::::::::::::Li::::::i n::::n    n::::nk::::::k   k:::::k 
LLLLLLLLLLLLLLLLLLLLLLLLiiiiiiii nnnnnn    nnnnnnkkkkkkkk    kkkkkkk
   
*/


  Game.Link = function ( param ) {

    param = param || {};
    this.id = Game.Link.prototype.id++;
  };

  Game.Link.prototype.id = 0;

  Game.Link.prototype.update = function ( ctx ) {
    /*
    var axis, radians;

    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    this.matrix.multiplySelf(rotObjectMatrix);

    this.rotation.setEulerFromRotationMatrix(this.matrix);
    */
  };


  Game.LinkCurves = function ( param ) {

    if ( typeof param === "undefined" || param.source === undefined || param.target === undefined )
      return;

    Game.Link.call( this, param );

    this.source = param.source;
    this.target = param.target;

    this.material = param.material || Materials.default;

    var getControlPoints = function ( p0, p1, nbSeg ) {
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

    var getNoisePoints = function ( controlPoints, amount ) {
      var pts = [], pt,
        l = controlPoints.length - 2,
        halfAmount = amount / 2
      ;

      pts.push( controlPoints[l + 1] );

      for ( var i = l; i > 1; i-- ) {

        pt = controlPoints[i];

        pts.push( new THREE.Vector3(
          pt.x,
          pt.y + random( amount ) - halfAmount,
          pt.z + random( amount ) - halfAmount
        ) );
      }

      pts.push( controlPoints[0] );

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

  Game.LinkCurves.prototype = Object.create( Game.Link.prototype );






  /**********
   * Init
   */

  this.map = [{
    name: "0",
    home: new Game.Planet( {
      radius: 50,
      rx: random( 1 ), ry: random( 1 ),
      //rsx: random( .05 ), rsy: random( .05 ),
      //material: "home",
      rsx: Number.MIN_VALUE, rsy: Number.MIN_VALUE,
      material: Materials.home,
      segW: 12, segH: 8, knead: .5
    } ),
    planets: [
      new Game.PlanetRed( { x: -150, y: 150 } ),
      new Game.PlanetRed( { x: 200, y: 20 } ),
      new Game.PlanetYellow( { x: -200, y: -200 } ),
      new Game.PlanetYellow( { x: 150, y: 200 } ),
      new Game.PlanetBlue( { x: 500, y: -250 } ),
      new Game.PlanetBlue( { x: -500, y: 100 } )
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

  this.mouse = { x: 0, y: 0, intersects: [], planetIdHovered: [] };

  this.scene = new THREE.Scene();

  this.stars = [];

  var currentMap = this.map[this.currentMapIndex];

  // create home
  this.home = currentMap.home;
  this.stars.push( this.home );
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

  // set a directional light
  //var directionalLight = new THREE.DirectionalLight( 0xffffff, .75 );
  //directionalLight.direction = new THREE.Vector3( 0, 0, -1 );
  //directionalLight.position.z = 500;
  //directionalLight.name = "directionalLight";
  //this.scene.add( directionalLight );

  var pointLight0 = new THREE.PointLight( 0xffffff, 1 );
  pointLight0.position.set( 0, 0, 500 );
  pointLight0.name = "pointLight0";
  this.scene.add( pointLight0 );


  // set point lights
  var
    lightZ = 0,
    lightXY = 400,
    lightColor = Colors.white,
    lightIntensity = .4,
    lightDistance = undefined,
    lightHelpers = false;
  ;

  var pointLight0 = new THREE.PointLight( lightColor, lightIntensity, lightDistance );
  pointLight0.position.set( -lightXY, lightXY, lightZ );
  pointLight0.name = "pointLight0";
  this.scene.add( pointLight0 ); if ( lightHelpers )
    this.scene.add( new THREE.PointLightHelper( pointLight0, 10 ) );

  var pointLight1 = new THREE.PointLight( lightColor, lightIntensity, lightDistance );
  pointLight1.position.set( lightXY, lightXY, lightZ );
  pointLight1.name = "pointLight0";
  this.scene.add( pointLight1 ); if ( lightHelpers )
    this.scene.add( new THREE.PointLightHelper( pointLight1, 10 ) );

  var pointLight2 = new THREE.PointLight( lightColor, lightIntensity, lightDistance );
  pointLight2.position.set( lightXY, -lightXY, lightZ );
  pointLight2.name = "pointLight0";
  this.scene.add( pointLight2 ); if ( lightHelpers )
    this.scene.add( new THREE.PointLightHelper( pointLight2, 10 ) );

  var pointLight3 = new THREE.PointLight( lightColor, lightIntensity, lightDistance );
  pointLight3.position.set( -lightXY, -lightXY, lightZ );
  pointLight3.name = "pointLight3";
  this.scene.add( pointLight3 ); if ( lightHelpers )
    this.scene.add( new THREE.PointLightHelper( pointLight3, 10 ) );

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

  this.camera = new THREE.PerspectiveCamera( 90, width / height, 1, 600 );
  this.camera.position.set( 0, 0, 500 );

  //var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  //var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  //this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
  //this.scene.add( this.camera );
  //this.camera.position.set( 0, 150, 400 );
  //this.camera.lookAt( this.scene.position );






  /**************
   * TEST volumetric curves
   */

  var target = this.stars[Math.round( random( 1, this.stars.length - 1 ) )].mesh;

  var linkTest = new Game.LinkCurves(
    {
      source: this.home.mesh,
      target: target,
      material: target.material
    }
  );

  this.scene.add( linkTest.mesh );


  /**************
   * TEST ray picking helper
   */

  this.scene.add(
    this.rayHelper =
    new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.LineCurve( this.camera.position.clone().add( new THREE.Vector3( 0, -20, 0 ) ), this.home.mesh.position ),
        /*segments*/1, /*radius*/5, /*segments radius*/3, /*closed*/false, /*debug*/true
      ),
      Materials.red
    )
  );
  this.rayHelper.visible = false;

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

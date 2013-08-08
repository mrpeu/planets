

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




Game = function ( container ) {

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

    if ( typeof ( param.mat ) !== 'undefined' ) {
      if ( param.mat == "home" ) {
        this.material = new THREE.ShaderMaterial(
          {
            uniforms:
            {
            },
            vertexShader: document.getElementById( 'vsHome' ).textContent,
            fragmentShader: document.getElementById( 'fsHome' ).textContent,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
          }
        );
      } else {
        param.mat.ambient = param.mat.color;
        this.material = new THREE.MeshLambertMaterial( param.mat );
      }
    }
    else
      this.material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, wireframe: true } );

    var geometry = new THREE.SphereGeometry( this.radius, this.segW, this.segH );
    geometry.mergeVertices();

    this.mesh = new THREE.Mesh( geometry, this.material );

    this.mesh.position.x = param.x || 0;
    this.mesh.position.y = param.y || 0;

    this.mesh.rotation.x = param.rx || 0;
    this.mesh.rotation.y = param.ry || 0;

    this.mesh.glowMesh = this.initGlow( this.mesh );

    this.knead( param.knead || .5 );

    this.planetId = this.mesh.planetId = Planet.prototype.planetId++;

    this.mesh.name = "Planet" + this.planetId;
    this.mesh.glowMesh.name = this.mesh.name + "-" + "glowMesh";
  };

  Planet.prototype.planetId = 0;

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

  Planet.prototype.move = function ( ctx ) {

    if ( this.free ) {

      this.mesh.position.x += this.sx;
      this.mesh.position.y += this.sy;

      this.sx += this.ax;
      this.sy += this.ay;
    }

    this.mesh.rotation.x += this.rsx;
    this.mesh.rotation.y += this.rsy;

  };

  Planet.prototype.knead = function ( min, max ) {
    // rq: careful this is in not correct and only work for a planet at the origin

    if ( min == undefined ) return;

    if ( max == undefined ) {
      var d = min / 2;
      max = 1 + d;
      min = 1 - d;
    }

    var r = this.radius / 10;

    this.mesh.geometry.vertices.forEach( function ( v ) {

      v.multiplyScalar( random( min, max ) );

      v[random( ['x', 'y', 'z'] )] += random( r );

    }, this.mesh );
  }


  var PlanetYellow = function ( param ) {

    param = param || {};
    param.mat = param.mat || {};
    param.mat.color = param.mat.color || 0xEEEE11;

    Planet.call( this, param );
  }

  PlanetYellow.prototype = Object.create( Planet.prototype );


  var PlanetBlue = function ( param ) {

    param = param || {};
    param.mat = param.mat || {};
    param.mat.color = param.mat.color || 0x0CCFFF;

    Planet.call( this, param );
  }

  PlanetBlue.prototype = Object.create( Planet.prototype );


  var PlanetRed = function ( param ) {

    param = param || {};
    param.mat = param.mat || {};
    param.mat.color = param.mat.color || 0xFF4444;

    Planet.call( this, param );
  }

  PlanetRed.prototype = Object.create( Planet.prototype );


  // vars for mouseMove
  var ray = new THREE.Raycaster();
  var projector = new THREE.Projector();
  var directionVector = new THREE.Vector3();
  var starsHovered = []; // id of the star currently hovered

  var mouseMove = function ( e ) {

    var x = e.clientX - this.CANVAS_WIDTH / 2,
        y = -e.clientY + this.CANVAS_HEIGHT / 2,
        mouseVec3 = new THREE.Vector3( x, y, 0 ),
        _starsHovered = starsHovered,
        // loop vars
        star, d, r
    ;

    starsHovered = [];

    for ( i in this.stars ) {
      star = this.stars[i];
      d = star.mesh.position.distanceTo( mouseVec3 );
      r = star.mesh.geometry.boundingSphere.radius;

      //if(i==0) console.log(d + " << " + JSON.stringify(mouseVec3) );

      if ( d < r ) {
        starsHovered.push( star.planetId );
        star.mesh.glowMesh.visible = true;
      }
    }

    if ( _starsHovered.length > 0 )
      for ( i in this.stars ) {
        var star = this.stars[i];

        for ( j in _starsHovered ) {
          var _starId = _starsHovered[j];

          if ( star.planetId == _starId )
            if ( starsHovered.indexOf( star.planetId ) < 0 ) {
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


  Game.prototype.resizeContainer = function () {

    CANVAS_WIDTH = window.innerWidth - 5;
    CANVAS_HEIGHT = window.innerHeight - 5;

    this.renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );

    this.camera.left = CANVAS_WIDTH / -2;
    this.camera.right = CANVAS_WIDTH / 2;
    this.camera.top = CANVAS_HEIGHT / 2;
    this.camera.bottom = CANVAS_HEIGHT / -2;

    this.camera.aspect = CANVAS_WIDTH / CANVAS_HEIGHT;

    this.camera.updateProjectionMatrix();
  };

  Game.prototype.update = function ( ctx ) {

    for ( var i = this.stars.length - 1; i >= 0; i-- ) {
      this.stars[i].move( ctx );
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
      //mat: "home",
      rsx: Number.MIN_VALUE, rsy: Number.MIN_VALUE,
      mat: { color: 0x77FF55, shading: THREE.FlatShading },
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
  var p = currentMap.home;
  this.stars.push( p );
  this.scene.add( p.mesh );

  //console.log("Created " + p.mesh.name + " #" + p.planetId + ". proto=#" + Planet.prototype.planetId);

  // create satellites
  for ( var i = currentMap.planets.length - 1; i >= 0; i-- ) {

    p = currentMap.planets[i];

    this.stars.push( p );

    this.scene.add( p.mesh );

    //console.log("Created " + p.mesh.name + " #" + p.planetId + ". proto=#" + Planet.prototype.planetId);

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
  var lightZ = 500, lightXY = 750, lightColor = 0xFFFFFF, lightIntensity = .6, lightDistance = undefined;

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

  window.addEventListener( 'resize', this.resizeContainer.bind( this ) );

  window.addEventListener( 'mousewheel', mouseWheel.bind( this ) );

  this.container.addEventListener( 'mousemove', mouseMove.bind( this ) );


  var width = this.CANVAS_WIDTH,
      height = this.CANVAS_HEIGHT;

  //this.camera = new THREE.OrthographicCamera( width / -2, width / 2, height / 2, height / -2, -100, 600 );
  this.camera = new THREE.PerspectiveCamera( 80, width / height, 1, 600 );
  this.camera.position.z = 500;






  /**************
   * TEST volume curves
   */

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

  var p0 = this.stars[0].mesh.position,
      p1 = this.stars[2].mesh.position,
      ctrlPts,
      nbCtrlPts = 15,
      nbSeg = 90, radiusSeg = 3,
      noiseAmount = 25
  ;

  ctrlPts = getControlPoints( p0, p1, nbCtrlPts );
  
  thunderGeo = 
    new THREE.TubeGeometry( new THREE.LineCurve( p0, p1 ), 1, 1, radiusSeg, false )
  ;

  THREE.GeometryUtils.merge( thunderGeo,
    new THREE.TubeGeometry(
      new THREE.SplineCurve3(
        getNoisePoints( ctrlPts, noiseAmount )
      ), nbSeg, 2, radiusSeg, false
    )
  );

  THREE.GeometryUtils.merge( thunderGeo,
    new THREE.TubeGeometry(
      new THREE.SplineCurve3(
        getNoisePoints( ctrlPts, noiseAmount )
      ), nbSeg, 2, radiusSeg, false
    )
  );
  
  this.scene.add( thunderMesh = new THREE.Mesh( thunderGeo, new THREE.MeshNormalMaterial({ opacity: 0.75, transparent: true  } ) ) );

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

if ( game != "undefined" )
  game.render();








// next step: http://stemkoski.github.io/Three.js/Mouse-Over.html
// or http://yomotsu.github.io/threejs-examples/ray_basic/
// http://www.89a.co.uk/page/14
// http://mrdoob.github.io/three.js/examples/canvas_lines.html

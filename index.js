

//----------
// utils

// src: https://github.com/soulwire/sketch.js/blob/master/js/sketch.js
random = function( min, max ) {

    if ( Object.prototype.toString.call( min ) == '[object Array]' )

        return min[ ~~( Math.random() * min.length ) ];

    if ( typeof max != 'number' )

        max = min || 1, min = 0;

    return min + Math.random() * ( max - min );
};
// src: Paul Irish obv
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();




(function(){
  //---------
  // Map
  //

  var map = [{
  	name: "0",
  	home: { r: 40, rsx: 0.001, rsy: 0.001,  mat: { name: "home", color: 0x77FF55 }, segW: 10, segH: 10 },
  	planets: [
      { x: -150, y: 150, r: 20, mat: { color: 0xA55000 } },   
      { x:  200, y:  20, r: 14, mat: { color: 0xA55000 } },   
      { x: -200, y: -200, r: 17,mat: { color: 0xFFDD22 } },
      { x: 150, y: 200, r: 17, mat: { color: 0xFFDD22 } },
      { x: 500, y: -250, r: 20, mat: { color: 0x7755DD } },   
      { x: -500, y: 100, r: 14, mat: { color: 0x7755DD } }
  	]
  }];


  //---------
  // Planet
  //

  function Planet( param ) {
    this.init( param || {} );
  }

  Planet.prototype.planetId = 0;

  Planet.prototype.init = function( param ){

		this.free = param.free || false;

		this.radius = param.r || 10;

    this.mouseable = param.mouseable || true;

		// speed
		this.sx = param.sx || random( -0.5, 0.5 ) ;
		this.sy = param.sy || random( -0.5, 0.5 );
		// acceleration
		this.ax = param.ax || 0.0;
		this.ay = param.ay || 0.0;
    // rotation
    this.rx = param.rx || random( -0.01, 0.008);
    this.ry = param.ry || random( -0.01, 0.008);
    // rotation speed
    this.rsx = param.rsx || random( -0.01, 0.01);
    this.rsy = param.rsy || random( -0.01, 0.01);

    this.segW = param.segW || random( 5, 10 );
    this.segH = param.segW || random( 5, 10 );

		if(typeof(param.mat)!=='undefined'){
      param.mat.ambient =  param.mat.color;
			this.material = new THREE.MeshLambertMaterial( param.mat );
    }
		else
			this.material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, wireframe: true } ) ;

    this.geometry = new THREE.SphereGeometry( this.radius, this.segW, this.segH );
    this.mesh = new THREE.Mesh( this.geometry, this.material );

		this.mesh.position.x = param.x || 0;
		this.mesh.position.y = param.y || 0;

    this.mesh.rotation.x = param.rx || 0;
    this.mesh.rotation.y = param.ry || 0;

    this.mesh.glowMesh = this.initGlow( this.mesh );

    this.planetId = this.mesh.planetId = Planet.prototype.planetId++;
    
    this.mesh.name = "Planet" + this.planetId;
    this.mesh.glowMesh.name = this.mesh.name + "-" + "glowMesh";

  };


  Planet.prototype.initGlow = function(mesh){

    var matGlow = new THREE.ShaderMaterial( 
      {
        uniforms:       
        { 
          glowColor: { type: "v3", value: mesh.material.color },
          power: { type: "f", value: 1}
        },
        vertexShader:   document.getElementById( 'vsGlow' ).textContent,
        fragmentShader: document.getElementById( 'fsGlow' ).textContent,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      }
    );
    var geom = new THREE.SphereGeometry(mesh.geometry.radius, 15, 15);
    //var geom = mesh.geometry.clone();

    var glowMesh = new THREE.Mesh( geom, matGlow );
    glowMesh.scale.x = glowMesh.scale.y = glowMesh.scale.z = 1.5;
    glowMesh.visible = false;

    mesh.add(glowMesh);

    return glowMesh;
  };

	Planet.prototype.move = function( ctx ){

		if(this.free){

			this.mesh.position.x += this.sx;
			this.mesh.position.y += this.sy;

			this.sx += this.ax;
			this.sy += this.ay;
		}

    this.mesh.rotation.x += this.rsx;
		this.mesh.rotation.y += this.rsy;

	};


  function PlanetGold(){

  }

  PlanetGold.prototype = new Planet();

  //----------

  //----------
  // Init and go!
  //

  var CANVAS_WIDTH, CANVAS_HEIGHT,
      camera, 
      scene,
      sketch, 
      renderer,
      stars = [],
      currentMap = map[0]
  ;

  try{
      
      (function(){

        var
          container = document.body;//getElementById("container")
        ;
        
        function init() {

          //CANVAS_WIDTH = 640, CANVAS_HEIGHT = 480;
          CANVAS_WIDTH = window.innerWidth-5;
          CANVAS_HEIGHT = window.innerHeight-5;
          //CANVAS_WIDTH = container.clientWidth;
          //CANVAS_HEIGHT = container.clientHeight;

          renderer = new THREE.WebGLRenderer({ antialias: true });

          renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );

          container.appendChild( renderer.domElement );

          scene = new THREE.Scene();


          // create home
          var p;
          stars.push( p = new Planet( currentMap.home ));
          scene.add( p.mesh );

          console.log("Created " + p.mesh.name + " #" + p.planetId + ". proto=#" + Planet.prototype.planetId);

          // create satellites
          for (var i = map[0].planets.length - 1; i >= 0; i--) {

          	stars.push( p = new Planet( currentMap.planets[i] ) );
            scene.add(p.mesh);

          console.log("Created " + p.mesh.name + " #" + p.planetId + ". proto=#" + Planet.prototype.planetId);

          };

          // set a directional light
          var directionalLight = new THREE.DirectionalLight( 0xdddddd, 1 );
          directionalLight.position.z = 400;
          directionalLight.name = "directionalLight";
          scene.add( directionalLight );

          var ambientLight = new THREE.AmbientLight( 0x444444 );
          ambientLight.name = "ambientLight";
          //scene.add(ambientLight);
          

          window.addEventListener('resize', resize.bind(this));

          container.addEventListener('mousemove', mouseMove.bind(this));


          var width = CANVAS_WIDTH,
              height = CANVAS_HEIGHT;
          camera = new THREE.OrthographicCamera( CANVAS_WIDTH / - 2, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT / - 2, -100, 600 );
        };
        
        function resize() {
    
          CANVAS_WIDTH  = window.innerWidth-5;
          CANVAS_HEIGHT = window.innerHeight-5;          
          renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );

          camera.left = CANVAS_WIDTH / - 2;
          camera.right = CANVAS_WIDTH / 2;
          camera.top = CANVAS_HEIGHT / 2;
          camera.bottom = CANVAS_HEIGHT / - 2;
          camera.updateProjectionMatrix();

        };

          
        var ray = new THREE.Raycaster(),
          projector = new THREE.Projector(),
          directionVector = new THREE.Vector3(),
          starsHovered = []; // id of the star currently hovered
        ;
        function mouseMove( e ) {

          var x = e.clientX - CANVAS_WIDTH/2,
              y = -e.clientY + CANVAS_HEIGHT/2,
              mouseVec3 = new THREE.Vector3(x, y, 0),
              _starsHovered = starsHovered,
              // loop vars
              star, d, r
          ;

          starsHovered = [];

          for(i in stars){
            star = stars[i];
            d = star.mesh.position.distanceTo(mouseVec3);
            r = star.geometry.boundingSphere.radius;

            if( d < r )
            {
              starsHovered.push(star.planetId);
              star.mesh.glowMesh.visible = true;
            }
          }

          if(_starsHovered.length>0)
          for(i in stars){
            var star = stars[i];

            for(j in _starsHovered){
              var _starId = _starsHovered[j];

              if(star.planetId == _starId)
              if(starsHovered.indexOf( star.planetId ) < 0)
              {
                star.mesh.glowMesh.visible = false;
                break;
              }
            }
          }

        }

      
        function update( ctx ) {

          for (var i = stars.length - 1; i >= 0; i--) {
          	stars[i].move(ctx);
          }
        
        };
      
        function render() {

          window.requestAnimFrame( render, this );

          update( this );

          renderer.render( scene, camera );

        };


        init();

        render();

      })();
    
   } catch (error) {
     nogl = document.getElementById("nogl");
     nogl.innerHTML += "<h2>" + error.message + "</h2>";
     nogl.innerHTML += "<p>" + error.stack + "</p>";
     nogl.style.display = 'block';
  }

})();








// next step: http://stemkoski.github.io/Three.js/Mouse-Over.html
// or http://yomotsu.github.io/threejs-examples/ray_basic/
// http://www.89a.co.uk/page/14
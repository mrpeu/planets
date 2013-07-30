

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
  	home: { r: 30, mat: { color: 0xFFFFFF}, segW: 10, segH: 10 },
  	planets: [
  		{ x: -150, y: 150, r: 20, mat: { color: 0x22DD55 } },		
  		{ x: 200, y: 20, r: 14, mat: { color: 0x2255DD } }
  	]
  }];


  //---------
  // Planet
  //

  function Planet( param ) {
  	this.init( param );
  }

  Planet.prototype = {

    planetId: 0,

  	init: function( param ){

  		this.free = param.free || false;

  		this.radius = param.r || 10;

      this.mouseable = param.mouseable || true;

  		// speed
  		this.sx = param.sx || random( -0.5, 0.5 ) ;
  		this.sy = param.sy || random( -0.5, 0.5 );
  		// acceleration
  		this.ax = param.ax || 0.0;
  		this.ay = param.ay || 0.0;
  		// rotation speed
  		this.rx = param.rx || 0.001;
  		this.ry = param.ry || 0.002;

      this.segW = param.segW || random( 1, 6 );
      this.segH = param.segW || random( 1, 6 );

  		if(typeof(param.mat)!==undefined)
  			this.material = new THREE.MeshLambertMaterial( param.mat );
  		else
  			this.material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, wireframe: true } ) ;

      this.geometry = new THREE.SphereGeometry( this.radius, this.segW, this.segH );
      this.mesh = new THREE.Mesh( this.geometry, this.material );

  		this.mesh.position.x = param.x || 0;
  		this.mesh.position.y = param.y || 0;
      scene.add(this.mesh);

      this.mesh.glowMesh = this.initGlow( this.mesh );

      this.mesh.planetId = Planet.prototype.planetId++;
      
      this.mesh.name = "Planet" + this.mesh.planetId;
      this.mesh.glowMesh.name = this.mesh.name + "-" + "glowMesh";

    },

    initGlow: function(mesh){

      var matGlow = new THREE.ShaderMaterial( 
        {
          uniforms:       
          { 
            glowColor: { type: "v3", value: mesh.material.color },
            intensity: { type: "f", value: 1.0}
          },
          vertexShader:   document.getElementById( 'vertexShaderGlow'   ).textContent,
          fragmentShader: document.getElementById( 'fragmentShaderGlow' ).textContent,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true
        }
      );
      var glowMesh = new THREE.Mesh( mesh.geometry.clone(), matGlow );
      glowMesh.scale.x = glowMesh.scale.y = glowMesh.scale.z = 1.5;
      glowMesh.visible = false;
      mesh.add(glowMesh);
      return glowMesh;
    },

  	move: function( ctx ){

  		if(this.free){

  			this.mesh.position.x += this.sx;
  			this.mesh.position.y += this.sy;

  			this.sx += this.ax;
  			this.sy += this.ay;
  		}

      this.mesh.rotation.x += this.rx;
  		this.mesh.rotation.y += this.ry;

  	}

  };
  //----------

  //----------
  // Init and go!
  //

  //CANVAS_WIDTH = 640, CANVAS_HEIGHT = 480;
  CANVAS_WIDTH = window.innerWidth-20, CANVAS_HEIGHT = window.innerHeight-20;

  var camera, 
      scene,
      sketch, 
      renderer = new THREE.WebGLRenderer({ antialias: true }),
      stars = [], starsMesh = [],
      currentMap = map[0]
  ;

  try{
      
      (function(){

        var
          container = document.body//ElementById("container")
        ;
        
        function init() {


          renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );

          container.appendChild( renderer.domElement );

          scene = new THREE.Scene();


          // create home
          var p;
          stars.push( p = new Planet( currentMap.home ));
          starsMesh.push( p.mesh );
          scene.add( p.mesh );

          // create satellites
          for (var i = map[0].planets.length - 1; i >= 0; i--) {

          	stars.push( p = new Planet( currentMap.planets[i] ) );
            starsMesh.push( p.mesh );

          };

          // set a directional light
          var directionalLight = new THREE.DirectionalLight( 0xdddddd, 1.75 );
          directionalLight.position.z = 400;
          directionalLight.name = "directionalLight";
          scene.add( directionalLight );
          

          window.addEventListener('resize', resize.bind(this));

          container.addEventListener('mousemove', mouseMove.bind(this));


          camera = new THREE.PerspectiveCamera( 80, CANVAS_WIDTH/CANVAS_HEIGHT, 1, 1000 );
          camera.position.z = 500;

        };
        
        function resize() {
    
          CANVAS_WIDTH  = window.innerWidth-20;
          CANVAS_HEIGHT = window.innerHeight-20;
          
          renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );
        };

          
        var ray = new THREE.Raycaster(),
          projector = new THREE.Projector(),
          directionVector = new THREE.Vector3(),
          starHovered = -1;
        ;
        function mouseMove( e ) {

              // The following will translate the mouse coordinates into a number
              // ranging from -1 to 1, where
              //      x == -1 && y == -1 means top-left, and
              //      x ==  1 && y ==  1 means bottom right
              var x = ( e.clientX / CANVAS_WIDTH ) * 2 - 1;
              var y = -( e.clientY / CANVAS_HEIGHT ) * 2 + 1;

              // Now we set our direction vector to those initial values
              directionVector.set(x, y, 1);

              // Unproject the vector
              projector.unprojectVector(directionVector, camera);

              // Substract the vector representing the camera position
              directionVector.sub(camera.position);

              // Normalize the vector, to avoid large numbers from the
              // projection and substraction
              directionVector.normalize();

              // Now our direction vector holds the right numbers!
              ray.set(camera.position, directionVector);

              var intersects = ray.intersectObjects(starsMesh);


          var _starHovered = starHovered;
          if (intersects.length > 0) {
            //console.log('intersect: ' + intersects[0].point.x.toFixed(2) + ', ' + intersects[0].point.y.toFixed(2) + ', ' + intersects[0].point.z.toFixed(2) + ')');
            console.log( "Intersects " + intersects[0].object.name + " #" + intersects[0].object.planetId);

            starHovered = intersects[0].object.planetId;

            intersects[0].object.glowMesh.visible = true;
          }
          else {
            starHovered = -1;
          }

          if(_starHovered != starHovered){
            // find the previously hovered star and unselect it
            for(i in stars)
              if(stars[i].mesh.planetId == _starHovered){
                stars[i].mesh.glowMesh.visible = false;
                break;
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
// http://www.89a.co.uk/post/39031599634/pudding
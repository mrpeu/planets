

//----------
// utils

random = Math.random;

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
  	home: { r: 30, mat: { color: 0xFFFFFF} },
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

  	init: function( param ){

  		this.free = param.free || false;
  		this.radius = param.r || 10;

  		// speed
  		this.sx = param.sx || random( -0.5, 0.5 ) ;
  		this.sy = param.sy || random( -0.5, 0.5 );
  		// acceleration
  		this.ax = param.ax || 0.0;
  		this.ay = param.ay || 0.0;
  		// rotation speed
  		this.rx = param.rx || 0.001;
  		this.ry = param.ry || 0.002;

  		if(typeof(param.mat)!==undefined)
  			this.material = new THREE.MeshLambertMaterial( param.mat );
  		else
  			this.material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, wireframe: true } ) ;

          this.geometry = new THREE.SphereGeometry( this.radius );
          this.mesh = new THREE.Mesh( this.geometry, this.material );

  		this.mesh.position.x = param.x || 0;
  		this.mesh.position.y = param.y || 0;

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
  // Init and go!
  //

  var camera, 
      scene,
      sketch, 
      renderer = new THREE.WebGLRenderer(),
      stars = [],
      currentMap = map[0]
  ;

  try{
    
      var
        container = document.getElementById("container")
      ;
      
      function init() {


        renderer.setSize( 640, 480 );

        container.appendChild( renderer.domElement );

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 80, 640/480, 1, 1000 );
        camera.position.z = 500;

        //camera = new THREE.OrthographicCamera( 
        //  this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 1000 
        //);


        var p; // tmp

        // create home
        stars.push( p = new Planet( currentMap.home ));
        scene.add( p.mesh );

        // create satellites
        for (var i = map[0].planets.length - 1; i >= 0; i--) {

        	stars.push( p = new Planet( currentMap.planets[i] ) );
        	scene.add( p.mesh );

        };

        // set a directional light
        var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
        directionalLight.position.z = 3;
        scene.add( directionalLight );

        scene.add( directionalLight );
        

        window.addEventListener('resize', resize.bind(this));

        render();

      };
      
      function resize() {

        camera.left = window.innerWidth / - 2;
        camera.right = window.innerWidth / 2;
        camera.top = window.innerHeight / 2;
        camera.bottom = window.innerHeight / - 2;

        camera.updateProjectionMatrix();
        
        renderer.setSize( this.width, this.height );
      };
    
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
    
   } catch (error) {
     nogl = document.getElementById("nogl");
     nogl.innerHTML += "<h2>" + error.message + "</h2>";
     nogl.innerHTML += "<p>" + error.stack + "</p>";
     nogl.style.display = 'block';
  }

})();

// next step: http://stemkoski.github.io/Three.js/Mouse-Over.html
// or http://yomotsu.github.io/threejs-examples/ray_basic/

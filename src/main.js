"use strict";

let _lastFrameRenderTime = 0;
let canvas = document.getElementById("renderCanvas");
let engine;
let scene;
let camera;
let sphere;
let n = 0;

function createScene()
{
	// Create scene
	let scene = new BABYLON.Scene(engine);
	
	// Create simple sphere
	sphere = BABYLON.Mesh.CreateIcoSphere("sphere", {radius:0.2, flat:true, subdivisions: 1}, scene);
	sphere.position.y = 3;
	sphere.material = new BABYLON.StandardMaterial("sphere material", scene)
	
	// Lights and camera
	let light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, -0.5, 1.0), scene);
	light.position = new BABYLON.Vector3(0, 5, -2);
	
	camera = new BABYLON.FreeCamera("sceneCamera", new BABYLON.Vector3(0, 3, -5), scene);
	camera.setTarget(new BABYLON.Vector3(0, 0, 0));
//	camera.attachControl(canvas, true);
	
	// Default Environment
	let environment = scene.createDefaultEnvironment({ enableGroundShadow: true, groundYBias: 1 });
	environment.setMainColor(BABYLON.Color3.FromHexString("#223344"));
	
	// Shadows
	let shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
	shadowGenerator.useBlurExponentialShadowMap = true;
	shadowGenerator.blurKernel = 32;
	shadowGenerator.addShadowCaster(sphere, true);
	
	// Enable VR
	let vrHelper = scene.createDefaultVRExperience({ createDeviceOrientationCamera:true });
	
	// Runs every frame to rotate the sphere
	scene.onBeforeRenderObservable.add(onUpdate);
	
	return scene;
};

function init()
{
	engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
	scene = createScene();
	engine.runRenderLoop(onRenderLoop);
}

function onRenderLoop()
{
	let now;
	
	if (!scene)
	{
		return;
	}
	
	now = (new Date()).getTime();
	
	if (FPS_LIMIT)
	{
		if (_lastFrameRenderTime + 1000/FPS > now)
		{
			return;
		}
		
		_lastFrameRenderTime = now;
	}
	
	scene.render();
}

function onResize()
{
	engine.resize();
}

function log2()
{
	console.log("-");
	console.log(camera.cameraDirection);
	console.log(camera.cameraRotation);
}

function onUpdate()
{
	n++;
	scene.activeCamera.position.y = 5 + Math.sin(n / 1000) * 2;
	// scene.activeCamera.position.z = -15 + Math.sin(n / 3) * 5;
	
	sphere.rotation.y += 0.0005 * scene.getEngine().getDeltaTime();
	sphere.rotation.x += 0.0005 * scene.getEngine().getDeltaTime();
}

window.addEventListener("resize", onResize);
window.addEventListener("load", init);
window.setInterval(log2, 1000);

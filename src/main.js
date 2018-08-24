"use strict";

let _lastFrameRenderTime = 0;
let canvas = document.getElementById("renderCanvas");
let engine;
let scene;
let camera;
let sphere;
let n = 0;

let _a;
let _material;
let _loader;
let _box;
let _boxes;
let _shadowGenerator;
let _light;

function createScene()
{
	// Create scene
	let scene = new BABYLON.Scene(engine);
	let plane;
	
	_light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 0, -30), scene);
	_light.intensity = 0.5;
	
	camera = new BABYLON.FreeCamera("sceneCamera", new BABYLON.Vector3(0, 5, -15), scene);
	camera.attachControl(canvas, true);
	
	let mat2 = new BABYLON.StandardMaterial("sa", scene);
	mat2.diffuseColor = new BABYLON.Color3(1, 0.8, 0.3);
	
	_material = new BABYLON.StandardMaterial("sphere material", scene);
//	_material.alpha = 0.5;
	_material.backFaceCulling = true;
	
	_loader = new BABYLON.AssetsManager(scene);
	_box = _loader.addMeshTask("box", "", "./", "icosahedron.obj");
	_loader.onFinish = loaderFinished;
	_loader.load();
	
	_shadowGenerator = new BABYLON.ShadowGenerator(1024, _light);
	_shadowGenerator.useBlurExponentialShadowMap = true;
	_shadowGenerator.blurKernel = 32;
	
	plane = BABYLON.Mesh.CreatePlane('impostor', 100, scene);
	plane.position.z = 50;
	plane.receiveShadows = true;
	plane.material = mat2;
	
	scene.onBeforeRenderObservable.add(onUpdate);
	
	// Enable VR
	let vrHelper = scene.createDefaultVRExperience({ createDeviceOrientationCamera:true });
	
	return scene;
}

function loaderFinished()
{
	let i, a, base;
	
	_boxes = [];
	
	base = _box.loadedMeshes[0];
	base.material = _material;
	base.setEnabled(false);
	base.scaling.x = 0.3;
	base.scaling.y = 0.3;
	base.scaling.z = 0.3;
	_shadowGenerator.addShadowCaster(base, true);
	
	for (i=0; i<15; i++)
	{
		a = base.createInstance();
		_shadowGenerator.addShadowCaster(a, true);
		_boxes.push(a);
	}
	
}

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

function onUpdate()
{
	let i;
	
	n += 0.1;
	
	if (_boxes)
	{
		for (i=0; i<_boxes.length; i++)
		{
			_boxes[i].position.x = Math.sin((n * 0.3 + i) / 10) * 5;
			_boxes[i].position.y = Math.sin((n * 0.3 + i) / 15) * 5;
			_boxes[i].position.z = Math.sin((n * 0.3 + i) / 20) * 5;
			_boxes[i].rotation.z = Math.sin((n * 0.3 + i) / 5) * 5;
		}
	}
}

window.addEventListener("resize", onResize);
window.addEventListener("load", init);

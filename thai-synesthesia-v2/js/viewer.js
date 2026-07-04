import * as THREE from "three";

import {

    labToColor

}
from "./colorSpace.js";

// =====================================

export default class LabViewer{

    constructor(container){

        this.container = container;

        this.scene = null;

        this.camera = null;

        this.renderer = null;

        this.group = null;

        this.raycaster = new THREE.Raycaster();

        this.mouse = new THREE.Vector2();

        this.selectedColor = null;

        this.onColorChanged = null;

        this.animate = this.animate.bind(this);

        this.init();

        this.instanceMesh = null;

        this.instanceColors = [];

    }

    init(){

        // -------------------------

        this.scene =
            new THREE.Scene();

        this.scene.background =
            new THREE.Color(0x101010);

        // -------------------------

        this.camera =
            new THREE.PerspectiveCamera(

                45,

                this.container.clientWidth/

                this.container.clientHeight,

                0.1,

                1000

            );

        this.camera.position.set(

            0,

            0,

            180

        );

        // -------------------------

        this.renderer =
            new THREE.WebGLRenderer({

                antialias:true

            });

        this.renderer.setSize(

            this.container.clientWidth,

            this.container.clientHeight

        );

        this.container.appendChild(

            this.renderer.domElement

        );

        // -------------------------

        const light =

            new THREE.DirectionalLight(

                0xffffff,

                1.2

            );

        light.position.set(

            1,

            1,

            1

        );

        this.scene.add(light);

        this.scene.add(

            new THREE.AmbientLight(

                0xffffff,

                .7

            )

        );

        // -------------------------

        this.group =
            new THREE.Group();

        this.scene.add(

            this.group

        );

        this.createColorVolume();

        // -------------------------

        this.renderer.domElement

        .addEventListener(

            "pointermove",

            this.onPointerMove.bind(this)

        );

        // -------------------------

        this.animate();

    }

createColorVolume(){

    const size = 3;

    for(

        let L=0;

        L<=100;

        L+=4

    ){

        for(

            let a=-110;

            a<=110;

            a+=4

        ){

            for(

                let b=-110;

                b<=110;

                b+=4

            ){

                const color =

                    labToColor(

                        L,

                        a,

                        b

                    );

                if(color==null){

                    continue;

                }

                const geometry =
                    new THREE.BoxGeometry(size,size,size);

                const material =
                    new THREE.MeshLambertMaterial();

                const mesh =
                    new THREE.InstancedMesh(
                        geometry,
                        material,
                        instanceCount
                    );
            }

        }

    }

}

onPointerMove(event){

    const rect =

        this.renderer.domElement

        .getBoundingClientRect();

    this.mouse.x =

        ((event.clientX-rect.left)

        /rect.width)*2-1;

    this.mouse.y =

        -((event.clientY-rect.top)

        /rect.height)*2+1;

    this.raycaster.setFromCamera(

        this.mouse,

        this.camera

    );

    const hit =

        this.raycaster

        .intersectObjects(

            this.group.children

        );

    if(hit.length==0){

        return;

    }

    const color =

        hit[0].object.userData;

    this.selectedColor = color;

    if(this.onColorChanged){

        this.onColorChanged(

            color

        );

    }

}

animate(){

    requestAnimationFrame(

        this.animate

    );

    this.group.rotation.y +=0.002;

    this.renderer.render(

        this.scene,

        this.camera

    );

}

}
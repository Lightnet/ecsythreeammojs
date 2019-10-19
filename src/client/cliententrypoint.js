/*
 Project: 
 Created by: Lightnet
 License: MIT
 Information: Work in progres.
 */
localStorage.clear();

//import {setGun} from './mjs';
//import App from './App01.svelte';
//import App from './App02.svelte';
//import App from './App03.svelte';
//import App from './App04.svelte';
//import App from './App05.svelte';
import { sAmmo } from "./g";
import "../common/ammo";
import App from './AppECSY01.svelte';

function init(){
	const app = new App({
		target: document.body,
		props: {
			//name: 'MJS'
		}
	});
}

window.addEventListener('load', (event) => {
	//console.log(window.Ammo$1);
	window.Ammo$1().then(function(Ammo){
		sAmmo(Ammo);//load and save gobal for tmp transform
		//console.log("Ammo", Ammo);
	});
	init();
});

//works
//import "../common/ammo";
//window.addEventListener('load', (event) => {
	//console.log('page is fully loaded');
	//console.log(Ammo$1);
	//console.log(window.Ammo);
	//window.Ammo().then(function(Ammo){
		//console.log("ammo", Ammo);
	//});
//});
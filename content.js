var fa_link = document.createElement("link");
fa_link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css";
fa_link.type = "text/css";
fa_link.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(fa_link);

var local_link = document.createElement("link");
local_link.href = "styles.css";
local_link.type = "text/css";
local_link.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(local_link);


var about = document.getElementsByClassName('oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 pq6dq46d p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l dwo3fsh8 ow4ym5g4 auili1gw mf7ej076 gmql0nx0 tkr6xdv7 bzsjyuwj cb02d2ww j1lvzwm4');
var title = document.getElementsByClassName("gmql0nx0 l94mrbxd p1ri9a11 lzcic4wl bp9cbjyn j83agx80");

function waitForElement(){

	if(typeof about[0] !== "undefined" && typeof title[0] !== 'undefined' && about[0].getAttribute('href')!== null){
		//variable exists, do what you want
		
		var btn = document.createElement("BUTTON");
		btn.id = "crush_button";
		btn.classList.add('glow-on-hover');

		let user_id = null;
		var crush_count = 20;
		var crushFullName = title[0].innerText;

		var fetchcurr = about[0].getAttribute('href');
		user_id = fetchcurr.substring(1, fetchcurr.length-1 );

		var strings = document.getElementsByTagName('script');
		var myusername = "";

		for (var i = 0, l = strings.length; i < l; i++) {
			var str = strings[i].innerText;
			var n = str.indexOf("\"username\"");

			if(n != -1){
				var en = str.indexOf("\"", n+12);
				myusername = str.substring(n+12, en );
				break;
			}
		}

		btn.innerHTML = "<i class=\"fa fa-heart fa-3px\"></i>"; 
		btn.style.backgroundColor = 'white';
		btn.style.color = 'black';
		var port = chrome.runtime.connect({name: "knockknock"});

		port.postMessage({
			type: 'statCrush',
			username: myusername,
			crushname: user_id
		}); 
		var statCrush = 0;
		port.onMessage.addListener(function(response) {
			crush_count = response.crushCt;
			statCrush = response.statCrush;
			if (response.statCrush == 2){
				btn.style.backgroundColor = '#FF69B4';
				btn.style.color = 'white';
				btn.innerHTML = "<i class=\"fa fa-heart fa-5px\"></i>";
				
			}else if(response.statCrush == 1){
				btn.style.backgroundColor = '#0288d1';
				btn.style.color = 'white';
				btn.innerHTML = '<i class=\"fa fa-heart fa-3px\"></i>';
			}
		});
		
		btn.onclick =  function (){
			if (btn.style.backgroundColor != 'white'){
				btn.style.backgroundColor = '#fce205';
				btn.style.color = 'black';
				chrome.runtime.sendMessage({
					type: 'deleteDB',
					username: myusername,
					crushname: user_id
				});
			}		
			else if(crush_count < 15){
				btn.innerHTML = "<i class=\"fa fa-heart fa-3px\"></i>"
				btn.style.backgroundColor = '#3cc47c';
				btn.style.color = 'white';
				chrome.runtime.sendMessage({
					type: 'addDb',
					username: myusername,
					crushname: user_id,
					fullname: crushFullName
				});
			}
			chrome.runtime.sendMessage({
				type: 'queryDb'
			});
		};
		
		// Add button styles here
		btn.style.marginLeft = '40%'
		btn.style.marginRight = '40%';
		btn.style.marginTop = '5px';
		btn.style.borderRadius = '15px';
		btn.style.width = '30px'
		btn.style.height = '30px';
		btn.style.borderColor = 'red';
		

		if(user_id != myusername){
			let divElement = document.getElementsByClassName('bi6gxh9e aov4n071')[0];
			divElement.appendChild(btn);
		}
    }
    else{
        setTimeout(waitForElement, 100);
    }
    return true;
}

waitForElement();

var SerialPort = require('serialport');
var prompt = require('prompt');
prompt.start();
var portname ="COM1";
SerialPort.list(function (err, ports) {
	if(process.argv.length == 2){
		if(ports.length == 0){
			console.log("ERROR: NO SERIAL PORTS DETECTED\t please specify port as a command line argument");
			process.exit();
		}
		else if(ports.length > 1){
			console.log("MORE THAN ONE SERIAL PORT DETECTED: WHICH ONE IS IT?");
			i=1;
			ports.forEach(function(nPort){
				console.log(i+") "+nPort.comName+"\t"+nPort.manufacturer+"\n");
				i++;
			});
			prompt.get(['Number'], function(err, result){
					console.log("CONNECTING...");
					portname = ports[result.Number-1].comName;
 					setSerialPort();
			});
		}
		else{
			console.log("AUTODETECTING SERIAL PORT...")
			console.log("THE FOLLOWING PORT WAS CHOSEN: \t"+ports[0].comName+"  "+ports[0].manufacturer);
			portname = ports[0].comName;
			setSerialPort();
		}

	}
	else{
		console.log("OPENING "+process.argv[2]+"...");
		portname = process.argv[2];
		setSerialPort();
	}
});
var express = require('express')
var currentWeapon;
var app = express()
var bodyParser = require('body-parser')
var fs = require('fs');
var armes = require("./armes.json")
var STEAM_ID = "76561198011087702" //===============Obviously change this to your steamid==================//
var roundKills = 0;
var numberToSend;
var previousNumber;
var port;



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.get('/', function (req, res) {
  res.send('Hello World!')
})

wrapper = new Wrapper();
app.post('/', function(req, res){
	if(req.body.player.activity === 'playing' && req.body.round.phase !=='undefined' && req.body.player.steamid === STEAM_ID && !isSpectatingMatch(req.body) ){ // Check that the user is indeed in-game and that we are not spectating someone else
			if(req.body.round.phase === 'over' ){ //Write to file when round ends
				i=0;
				for (var arma in armes){
					if(!arma){
						armes.splice(i,1);
					}
					i++;
				}
				fs.writeFileSync("armes.json", JSON.stringify(armes), "utf8");
				roundKills = 0;
			}
			if(isAlive(req.body)){
				checkKills(req, updateKills, updateCurrentWeapon)
			}

			else{
				if(wrapper.get()!= "-1"){
					wrapper.set("-1");
				}
				roundKills = 0;
			}
			if(req.body.round.phase === 'freezetime'){ //Reset the counter back to 0 when next round begins
				roundKills = 0;
			}
	}
	else if(req.body.player.activity != 'playing' && !req.body.map){
		console.log("this is the start menu");
		wrapper.set("-3");
		}

	if(req.body.player.activity === 'playing' && req.body.player.steamid != STEAM_ID){ //If we are spectating after dying
		wrapper.set("-2");
	}
	res.send('lel'); //Just a response to the server so we don't timeout

	
})

app.listen(3000, function () {
  console.log('\nWelcome To Stattrak™ Counter. Made by Alfredu with love\n\n');
})


function updateKills(killsNumber, weaponName){
	armes[weaponName] += killsNumber;
}

function updateCurrentWeapon(req){
	for(var weapon in req.body.player.weapons){ //For each weapon in our loadout, select which one is active
					if(req.body.player.weapons[weapon].state === 'active'){
						if(req.body.player.weapons[weapon] !== currentWeapon){
							console.log("HE CANVIAT A LA " + currentWeapon);
							currentWeapon = req.body.player.weapons[weapon].name;
							wrapper.set(armes[currentWeapon].toString());
						}
					}
				}
}

function checkKills(req, callback1, callback2){
	if(req.body.player.state.round_kills > roundKills && isAlive(req.body)){ //If we got a new kill, up the counter of that weapon
		
				updateKills(req.body.player.state.round_kills - roundKills, currentWeapon);
				roundKills = req.body.player.state.round_kills;
				console.log("HE SUMAT UNA KILL A LA" + currentWeapon );

				callback1(req);
				}
	else{
		callback2(req);
	}

}
function isSpectatingMatch(data){
	return data.hasOwnProperty('allplayers');
}

function isAlive(data){
	return data.player.state.health != 0;
}


function Wrapper(){
    var value ;
    this.set = function(v) {
    	if(value != v){
	        value = v;
	        port.write(v);
	    }
    }
    this.get = function() {
        return value;
    }  
}
function setSerialPort(){
	port = new SerialPort(portname, {
	baudrate : 38400,
	autoOpen : false
	});

	port.open();

	port.on('open', function(err){
	if(err){
		console.log(err);
	}
	else{
		console.log("SUCCESFULLY CONNECTED TO "+port.path+"!");
	}

	});
}
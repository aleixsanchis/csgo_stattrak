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
var SerialPort = require('serialport');
var port = new SerialPort('COM5', {
	baudrate : 38400,
	autoOpen : false
});

port.open();

port.on('open', function(err){
	if(err){
		console.log(err);
	}
	else{
		console.log("hola");
		port.write("1");
	}

});

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
			if(req.body.round.phase === 'over' ){ //Write to file when game ends
				fs.writeFileSync("armes.json", JSON.stringify(armes), "utf8");
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
	else if(req.body.player.activity != 'playing'){
			wrapper.set("-3");
			}

	if(req.body.player.activity === 'playing' && req.body.player.steamid != STEAM_ID){ //If we are spectating after dying
		wrapper.set("-2");
	}
	res.send('lel'); //Just a response to the server so we don't timeout

	
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
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
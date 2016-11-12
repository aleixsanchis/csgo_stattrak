//Quick script to reset the counter back to 0;

var fs = require('fs');
var armes = require("./armes.json");

for(arma in armes){
	armes[arma] = 0;
}
fs.writeFileSync("armes.json", JSON.stringify(armes), "utf8");

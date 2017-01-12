
/*
  Reading a serial ASCII-encoded string.

 This sketch demonstrates the Serial parseInt() function.
 It looks for an ASCII string of comma-separated values.
 It parses them into ints, and uses those to fade an RGB LED.

 Circuit: Common-Cathode RGB LED wired like so:
 * Red anode: digital pin 3
 * Green anode: digital pin 5
 * Blue anode: digital pin 6
 * Cathode : GND

 created 13 Apr 2012
 by Tom Igoe
 
 modified 14 Mar 2016
 by Arturo Guadalupi

 This example code is in the public domain.
 */

// pins for the LEDs:
const int redPin = 3;
const int pin2 = 4;
const int pin3= 5;
String cosa;

void setup() {
  // initialize serial:
  Serial.begin(38400);
  // make the pins outputs:
  pinMode(redPin, OUTPUT);
  pinMode(pin2, OUTPUT);
  pinMode(pin3, OUTPUT);
  pinMode(13,OUTPUT);
  
  Serial.setTimeout(15);
}

void loop() {
  // if there's any serial available, read it:
  while(Serial.available()){
    
      cosa = Serial.readString();
    if(cosa == "0"){
      digitalWrite(13,HIGH);
    }
    else{
      digitalWrite(13,LOW);
    }
  }
  

  
}









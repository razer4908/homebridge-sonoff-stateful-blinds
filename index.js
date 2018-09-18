var request = require('/usr/lib/node_modules/request');
var Service, Characteristic, HomebridgeAPI;

module.exports = function(homebridge){
        Service = homebridge.hap.Service;
        Characteristic = homebridge.hap.Characteristic;
	HomebridgeAPI = homebridge;
        homebridge.registerAccessory('homebridge-sonoff-stateful-blinds', 'StatefulSonoffBlinds', statefulsonoffblinds);
}

function statefulsonoffblinds(log, config){

    this.log = log; // log file
    this.name = config["name"]; 
    this.upURL = config["up_url"];
    this.downURL = config["down_url"];
    this.stopURLup = config["stop_url_up"];
    this.stopURLdown = config["stop_url_down"];
    this.sonoffURL = config["sonoff_url"];
    this.sonoffUpRelay = config["sonoff_up_relay"];
    this.sonoffDownRelay = config["sonoff_down_relay"];
    this.durationUp = config["time_up"];
    this.durationDown = config["time_down"];
    this.durationBMU = config["time_botton_margin_up"];
    this.durationBMD = config["time_botton_margin_down"]; 

    this.lastPosition = 100; // Last know position, (0-100%)
    this.currentPositionState = 2; // 2 = Stoped , 0=Moving Up , 1 Moving Down.
    this.currentTargetPosition = 0; //  Target Position, (0-100%)
    
    // Device information
    this.infoService = new Service.AccessoryInformation();
    this.infoService
        .setCharacteristic(Characteristic.Manufacturer, "Normando Marcolongo")
        .setCharacteristic(Characteristic.Model, "Stateful SonOff Blinds")
        .setCharacteristic(Characteristic.SerialNumber, "Version 1.0.0");

    // Setup persistence
    this.cacheDirectory = HomebridgeAPI.user.persistPath();
    this.storage = require('node-persist');
    this.storage.initSync({dir:this.cacheDirectory, forgiveParseErrors: true});

    // Register service
    this.service = new Service.WindowCovering(this.name);

    // Get current position (0-100)
    this.service
            .getCharacteristic(Characteristic.CurrentPosition)
            .on('get', this.getCurrentPosition.bind(this));

    // Get state
    // 2 = Stopped; 0 = Up; 1 = Down;
    this.service
            .getCharacteristic(Characteristic.PositionState)
            .on('get', this.getPositionState.bind(this));

    // Get or set goal position (0-100)
    this.service
            .getCharacteristic(Characteristic.TargetPosition)
            .on('get', this.getTargetPosition.bind(this))
            .on('set', this.setTargetPosition.bind(this));
    
    // Restore previous state
    var cachedState = this.storage.getItemSync(this.name);
    if(cachedState === undefined) { 
       this.log("No previous saved state. lastPosition set to default: %s", this.lastPosition);
    } else {
       this.lastPosition = cachedState;
       this.currentTargetPosition = cachedState;
       this.log("Previous saved state found. lastPosition set to: %s", this.lastPosition);
    }
}

statefulsonoffblinds.prototype.getCurrentPosition = function(callback) {
    this.log("Requested CurrentPosition: %s", this.lastPosition);
    callback(null, this.lastPosition);
}

statefulsonoffblinds.prototype.getPositionState = function(callback) {
    this.log("Requested PositionState: %s", this.currentPositionState);
    callback(null, this.currentPositionState);
}

statefulsonoffblinds.prototype.getTargetPosition = function(callback) {
    this.log("Requested TargetPosition: %s", this.currentTargetPosition);
    callback(null, this.currentTargetPosition);
}

statefulsonoffblinds.prototype.setTargetPosition = function(pos, callback) {

  this.log("Setting target position to %s", pos);
  if (this.currentPositionState != 2) {
    this.log("Blinds are moving. You need to wait. I will do nothing.");
    callback();
    return false;
  }

  if (this.currentPosition == pos) {
    this.log("Current position already matches target position. There is nothing to do.");
    callback();
    return true;
  }

  this.currentTargetPosition = pos;
  moveUp = (this.currentTargetPosition > this.lastPosition);
  
  var withoutmarginetimeUP;
  var withoutmarginetimeDOWN;
  var duration;
  withoutmarginetimeUP=this.durationUp-this.durationBMU;
  withoutmarginetimeDOWN=this.durationDown-this.durationBMD;
  
  if (moveUp) {
    if(this.lastPosition==0){
         duration = ((this.currentTargetPosition - this.lastPosition) / 100 * withoutmarginetimeUP)+this.durationBMU;
    } else {
         duration = (this.currentTargetPosition - this.lastPosition) / 100 * withoutmarginetimeUP;
    }
  } else {
    if(this.currentTargetPosition==0){
         duration = ((this.lastPosition-this.currentTargetPosition) / 100 * withoutmarginetimeDOWN)+this.durationBMD;
    } else {
         duration = (this.lastPosition-this.currentTargetPosition) / 100 * withoutmarginetimeDOWN;
    }  
  }
  duration = Math.round(duration);

  this.log("Duration: %s", duration);
  this.log(moveUp ? "Moving up" : "Moving down");
  this.service.setCharacteristic(Characteristic.PositionState, (moveUp ? 1 : 0));
  this.currentPositionState = (moveUp ? 1 : 0);
  
  //setTimeout(this.setFinalBlindsState.bind(this), duration);    
  //this.httpRequest((moveUp ? this.upURL : this.downURL));
  //clearTimeout(this.duration);   

  this.httpRequest((moveUp ?
     this.sonoffURL+"cm?cmnd=Backlog%20Power"+this.sonoffUpRelay+"%20On;Delay%20"+duration+";Power"+this.sonoffUpRelay+"%20Off" : 
     this.sonoffURL+"cm?cmnd=Backlog%20Power"+this.sonoffDownRelay+"%20On;Delay%20"+duration+";Power"+this.sonoffDownRelay+"%20Off"  
     ));
  setTimeout(this.setFinalBlindsState.bind(this), parseInt(duration)*100);    

  callback();

  return true;
}

statefulsonoffblinds.prototype.setFinalBlindsState = function() {
  
  //this.httpRequest((moveUp ? this.stopURLup : this.stopURLdown));
  this.currentPositionState = 2;
  this.service.setCharacteristic(Characteristic.PositionState, 2);
  this.service.setCharacteristic(Characteristic.CurrentPosition, this.currentTargetPosition);
  this.lastPosition = this.currentTargetPosition;
  this.log("Successfully moved to target position: %s", this.currentTargetPosition);
  // save state
  this.storage.setItemSync(this.name, this.lastPosition);
  this.log("Successfully saved state");
  return true;
}

// Bind URL for movements
statefulsonoffblinds.prototype.httpRequest = function(url, callback){
        this.log("Sonoff link for moving blinds:  " + url);                    
        request.get({
        url: url,
        }, function(err, response, body) {
                if (!err && response.statusCode == 200) {
     			return;
                } else {
                        this.log("Error getting state (status code %s): %s", response.statusCode, err);
                        return;
                }
        }.bind(this));
}

statefulsonoffblinds.prototype.getServices = function() {
  return [this.infoService, this.service];
}

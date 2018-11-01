# homebridge-sonoff-stateful-blinds

Sonoff Basic, Dual or 4CH/4CH Pro homebridge stateful plugin for blinds...


## Features

* Up or Down Blinds or Windows with 220V od 110V Motor (4 wire).
* You can now ask Siri to up / down any blinds in house

Explanations in config file for one blinds sonoff 4ch:
```
		"accessory": "StatefulSonoffBlinds",  // It must be for every service
		"name": "Blidns Kitchen", // Name of Blinds 
		"sonoff_url": "http://sonoff4-blinds.local/", //URL of the selected Sonoff device
            	"sonoff_up_relay": "3", // Relay number for the UP motor
            	"sonoff_down_relay": "4", // Relay number for the DOWN motor
		"time_up": 20000, // Total time from complete closing to full opening.
		"time_down": 20000, // Total time from complete opening to full closing.
		"time_botton_margin_up": 0, // Picture down
		"time_botton_margin_down": 0 // Picture down
```
Picture:
![Sonoff 4 CH or Sonoff 4 CH PRO](https://image.prntscr.com/image/t9-zocP7S6aOPRiCABXZ8g.png) <br>



## Wiring schema

This plugin use for:
###### * Two Sonoff Basic for one blinds.
![Sonoff Basic](https://image.prntscr.com/image/Uuei-zYxT6GjxtmQJ4aJuw.png)
###### * One Sonoff Dual for one blinds.
![Sonoff Dual](https://image.prntscr.com/image/YbYLfvLvT8W4pJhlYaa7yg.png)
###### * One Sonoff 4CH/4CHPRO for two blinds.
![Sonoff SONOFFPRO](https://image.prntscr.com/image/KaGDFaCMRBK0_eg6ooCAEw.png)

### Installation

1. Install required packages.

   ```
   npm i homebridge-sonoff-stateful-blinds
   ```

2. Add following lines to `config.json`.


   ```
	{
	"bridge": {
		"name": "Home of Name",
		"username": "CC:22:3D:E3:CE:30",
		"port": 51826,
		"pin": "123-45-568"
	           },
	"accessories":
	[
		{
		"accessory": "StatefulSonoffBlinds",
		"name": "Config for SonOff Basic (Different only because use two ipaddres for each sonoffbasic device)",
		"up_url": "http://192.168.2.10/control?cmd=GPIO,12,1",
		"down_url": "http://192.168.2.11/control?cmd=GPIO,12,1",
		"stop_url_up": "http://192.168.2.10/control?cmd=GPIO,12,0",
		"stop_url_down": "http://192.168.2.11/control?cmd=GPIO,12,0",
		"time_up": 20000,
		"time_down": 20000,
		"time_botton_margin_up": 0,
		"time_botton_margin_down": 0
		},
		{
		"accessory": "StatefulSonoffBlinds",
		"name": "Config for SonOff Dual (Only one ip addres with two gpio)",
		"up_url": "http://192.168.2.10/control?cmd=GPIO,12,1",
		"down_url": "http://192.168.2.10/control?cmd=GPIO,4,1",
		"stop_url_up": "http://192.168.2.10/control?cmd=GPIO,12,0",
		"stop_url_down": "http://192.168.2.10/control?cmd=GPIO,4,0",
		"time_up": 20000,
		"time_down": 40000,
		"time_botton_margin_up": 0,
		"time_botton_margin_down": 0
		},
		{
		"accessory": "StatefulSonoffBlinds",
		"name": "Config for SonOff 4CH (Only one ip addres and four gpio) 1 Blinds",
		"up_url": "http://192.168.2.10/control?cmd=event,4PowerOn",
		"down_url": "http://192.168.2.10/control?cmd=event,5PowerOn",
		"stop_url_up": "http://192.168.2.10/control?cmd=event,4PowerOff",
		"stop_url_down": "http://192.168.2.10/control?cmd=event,5PowerOff",
		"time_up": 20000,
		"time_down": 40000,
		"time_botton_margin_up": 0,
		"time_botton_margin_down": 0
		},
		{
		"accessory": "StatefulSonoffBlinds",
		"name": "Config for SonOff 4CH (Only one ip addres and four gpio) 2 Blinds",
		"up_url": "http://192.168.2.10/control?cmd=event,12PowerOn",
		"down_url": "http://192.168.2.10/control?cmd=event,15PowerOn",
		"stop_url_up": "http://192.168.2.10/control?cmd=event,12PowerOff",
		"stop_url_down": "http://192.168.2.10/control?cmd=event,15PowerOff",
		"time_up": 20000,
		"time_down": 40000,
		"time_botton_margin_up": 0,
		"time_botton_margin_down": 0
		}
	]
	}
   ```

3. Restart Homebridge, and your Sonoff basic a will be added to Home app.

/* Module */
/* Magic Mirror
 * Module: MMM-HTTPRequestDisplay
 *
 * By Eunan Camilleri eunancamilleri@gmail.com
 * v1.0 23/06/2016
 *
 * Modified by KAG 19/02/2019
 * Module: MMM-NOK
 *
 * MIT Licensed.
 */

Module.register("MMM-NOK",{
// Default module config.
	defaults: {
		refreshInterval: 5 * 60 * 1000, // every 5 minutes
		startYear:2010,
		currencyList: "USD+EUR+GBP",
	},


	// Define required scripts.
	getScripts: function() {
		return ["moment.js",];
	},

	// Define required styles.
	getStyles: function() {
		return ["MMM-NOK.css"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		this.loaded = false;
		moment.locale(config.language);

		// variables that will be loaded from service
		this.nodeNames = "";
		this.nodes = [];

		//Log.log("Sending CONFIG to node_helper.js in " + this.name);
		//Log.log("Payload: " + this.config);
		this.sendSocketNotification("CONFIG", this.config);
	},

	// unload the results from uber services
	processData: function(data) {

		if (!data) {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			Log.log("#No data");
			return;
		}

		this.data = data;
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			Log.log("#LOADED");
			return wrapper;
		}

		if (!this.data) {
			wrapper.innerHTML = "No data";
			Log.log("#NODATA");
			return wrapper;
		}

		var currency = this.data.getElementsByTagName("Series");
		//Log.log(waterValue);

		var tableHeading = document.createElement("div");
		tableHeading.className = "divider";

		var NOKIcon = document.createElement("img");
		NOKIcon.className = "icon";
		NOKIcon.src = "modules/MMM-NOK/Norges_bank_logo-1.png";
		tableHeading.appendChild(NOKIcon);
		wrapper.appendChild(tableHeading);

		tableWrapper = document.createElement("table");
		tableWrapper.className = "Mytable small";

		var row = tableWrapper.insertRow(-1);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Currency";
		row.appendChild(headerCell);

		var headerCell = document.createElement("th");
		headerCell.className = "Myth";
		headerCell.innerHTML = "Value";
		row.appendChild(headerCell);

		//Log.log(waterValue.length);

		if(currency.length > 0) {

			for(var i = 0; i < currency.length; i++) {

				var current=currency[i].getAttribute("BASE_CUR");
				
				if(current==="USD" || current==="EUR" || current==="GBP") {
					
					var eventWrapper = document.createElement("tr");
					eventWrapper.className = "Mytr";

					var lineWrapper = document.createElement("td");
					lineWrapper.className = "Mytd";
					lineWrapper.innerHTML = current;

					var firstChild = currency[i].firstChild;
					if(firstChild !== null) {
						var currencyValue=firstChild.getAttribute("OBS_VALUE");
					}
					var timeWrapper = document.createElement("td");
					timeWrapper.className = "Mytd";
					timeWrapper.innerHTML = currencyValue;

					eventWrapper.appendChild(lineWrapper);
					eventWrapper.appendChild(timeWrapper);

					tableWrapper.appendChild(eventWrapper);
				}
			}
		}
		else {
			var eventWrapper = document.createElement("tr");
			eventWrapper.className = "Mytr";

			var lineWrapper = document.createElement("td");
			lineWrapper.className = "Mytd";

			lineWrapper.innerHTML = "NO DATA";
			eventWrapper.appendChild(lineWrapper);
			tableWrapper.appendChild(eventWrapper);
		}


		//tableWrapper.appendChild(eventWrapper);
		wrapper.appendChild(tableWrapper);
		return wrapper;
	},

	socketNotificationReceived: function(notification, payload) {
		var parser, xmlDoc;

		if (notification === "STARTED") {
			this.updateDom();
			Log.log("#STARTED");
		}
		else if (notification === "DATA") {
			this.loaded = true;

			parser = new DOMParser();
			xmlDoc = parser.parseFromString(payload,"text/xml");

			this.processData(xmlDoc);
			this.updateDom();
		}
	},

});
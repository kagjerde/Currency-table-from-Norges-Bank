/* Magic Mirror
 * Node Helper: MMM-NOK
 *
 * By
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const request = require("request");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting node helper for: " + this.name);
    this.started = false;
  },

  getData: function() {
    const self = this;
    const myUrl = "https://data.norges-bank.no/api/data/EXR/B..NOK.SP?lastNObservations=1&format=sdmx-compact-2.1";

    request({
      url: myUrl,
      method: "GET",
      headers: {
        "User-Agent": "MagicMirror/1.0 ",
        "Accept-Language": "en_US",
        "Content-Type": "application/json",
      },
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        self.sendSocketNotification("DATA", body);
      }
    });

    setTimeout(function() {
      self.getData();
    }, self.config.refreshInterval);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "CONFIG" && !this.started) {
      this.config = payload;
      this.sendSocketNotification("STARTED", true);
      this.getData();
      this.started = true;
    }
  }
});

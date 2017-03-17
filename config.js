/*
    Web request URL's
*/

var APIBaseURL = 'https://api2.arctic-network.com/v1/'
var APIModsURL = 'mods'
var APIModHashlistURL = 'mod/hashlist/'

var TFARFileURL = 'https://webstorage2.gaming-provider.com/launcher/tfar/task_force_radio.ts3_plugin'
var TFARFileSize = 7552056


Array.prototype.extend = function (other_array) {
  /* you should include a test to check whether other_array really is an array */
  other_array.forEach(function(v) {this.push(v)}, this);
}
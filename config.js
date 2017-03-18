/*
    Web request URL's
*/

var APIBaseURL = 'https://api2.arctic-network.com/v1/'
var APIModsURL = 'mods'
var APIModHashlistURL = 'mod/hashlist/'

var STATICFILESERVE = 'https://webstorage1.gaming-provider.com/dwcentral/taunusliferpg/modpack/teamspeak/'

Array.prototype.extend = function (other_array) {
  /* you should include a test to check whether other_array really is an array */
  other_array.forEach(function(v) {this.push(v)}, this);
}
/* ­­­ LIBRARIES ­­­ */
var request = require('request');
var Twitter = require('twitter');
var colors = require('colors');
var _ = require('lodash');

/* ­­­ GLOBALS ­­­ */

var config = require('./config.json');
var hueColors = require('./hueColors');
var client = new Twitter(config.twitter_api);
var tweetHandler;
var changing = false;
var queue = [];
var BASE = 'http://' + config.hue_api.base;
var HUE_API = '/api/' + config.hue_api.api_key + '/lights/';

/* ­­­ METHODS ­­­ */

function getAllLights(cb) {
  var options = {
    baseUrl: BASE,
    url: HUE_API,
    method: 'GET'
  }

  request(options, function (error, response) {
    cb(JSON.parse(response.body));
  });
}

function checkMention(tweet) {
  return tweet.in_reply_to_user_id_str === config.user.id_str;
}

function findColors(text) {
  var availableColors = _.keys(hueColors);
  var colorsArr = [];

  availableColors.forEach(function(c) {
    if (text.indexOf(c) > -1) {
      colorsArr.push(c);
    }
  });

  return colorsArr.length ? colorsArr : null;
}

function findToggle(text) {
  if (text.toLowerCase().indexOf('lights off') > -1) {
    return 'off';
  } else if (text.toLowerCase().indexOf('lights on') > -1) {
    return 'on';
  }

  return null;
}

function changeLights(config) {
  changing = true;
  var changed = 0;

  config.forEach(function(c) {
    console.log(
      'CHANGING LIGHT '.yellow,
      '[ '.magenta,
      c.num.toString().magenta,
      ' ]'.magenta,
      ' WITH CONFIG: '.cyan
    );
    console.log(JSON.stringify(c, 0, 2).white);
    console.log('');
    var options = {
      baseUrl: BASE,
      url: HUE_API + c.num + '/state',
      method: 'PUT',
      body: JSON.stringify(c.state)
    }

    setTimeout(function() {
      request(options, function (error, response, body) {
        changed++;
        if (changed === config.length) {
          console.log('DONE CHANGING!'.green);
          changing = false;
          if (queue.length) {
            console.log('HANDING QUEUE')
            var nextTweet = queue.shift();
            tweetHandler(nextTweet);
          }
        }
      });
    }, Math.floor(Math.random() * 5000));
  });
}

function handleError(err) {
  console.log('');
  console.log('STREAM ERRORED !!!'.bold.red);
  console.log(JSON.stringify(err, 0, 2).red);
}

function addToQueue(tweet) {
  queue.push(tweet);
}

function createConfig(allLights, type, options) {
  var config = [];

  if (type === 'toggle') {
    _.keys(allLights).forEach(function(a) {
      config.push({
        'num': a,
        'state': {
           'on': options === 'on'
        }
      });
    });
  } else {
    var lights = _.keys(allLights);
    var chunks = Math.ceil(lights.length / options.length);
    var chunkArrs = [];

    while(lights.length) {
      chunkArrs.push(lights.splice(0, chunks));
    }

    chunkArrs.forEach(function(chunk, i) {
      chunk.forEach(function(num, k) {
        var opt = options[i] || _.sample(options);
        var color = hueColors[opt] || hueColors[_.sample(_.keys(hueColors))];
        var state = _.merge({'on': true}, color);

        config.push({
          'num': num,
          'state': state
        });
      });
    });
  }

  return config;
}

function createHandler(lights) {
  return function(tweet) {
    var isMention = checkMention(tweet);
    if (!isMention) return;

    var colors = findColors(tweet.text);
    var toggle = findToggle(tweet.text);

    if (!colors && !toggle) return;

    if (changing) {
      return addToQueue(tweet);
    }

    var type = toggle ? 'toggle' : 'colors';
    var options = toggle || colors;
    var config = createConfig(lights, type, options);
    changeLights(config);
  }
}

// get lights, create tweet handler + start stream
function setUp() {
  getAllLights(function(lights) {
    tweetHandler = createHandler(lights);

    client.stream('statuses/filter', {
      'follow': config.user.id_str
    }, function (stream) {
      console.log('STARTING HUE STREAM !'.rainbow.bold);
      stream.on('data', tweetHandler);
      stream.on('error', handleError);
    });
  });
}

setUp();

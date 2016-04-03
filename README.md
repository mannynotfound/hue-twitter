# hue-twitter

App to control Phillips Hue Lighting with tweets.

## Usage

Set up a config file that looks like:

```js
{
  "user": {
    "id_str": "your_userid", // account to track eg "17461978"
  },
  "twitter_api": {
    "consumer_key": "XXXX",
    "consumer_secret": "XXX",
    "access_token_key": "XXX",
    "access_token_secret": "XXX"
  },
  "hue_api": {
    "base": "XXXX", // hue ip eg 10.0.0.2
    "api_key": "XXX" // hue api key eg "3231313xx12313981231"
  }
}
```

then run `node app`

### Commands:

#### On
`@username lights on`

#### Off
`@username lights off`

#### Single Color
`@username chartreuse`

#### Multi Color
`@username coral salmon papaya whip crimson`

## Supported Colors:

```js
[
  "white",
  "red",
  "green",
  "blue",
  "brown",
  "chartreuse",
  "chocolate",
  "coral",
  "cyan",
  "fuschia",
  "gold",
  "hot pink",
  "indigo",
  "lime",
  "magenta",
  "navy",
  "orchid",
  "olive",
  "orange",
  "papaya whip",
  "pink",
  "plum",
  "purple",
  "salmon",
  "teal",
  "tomato",
  "yellow"
]
```

## TODO:

* Add a white list so only certain users can control
* Break concerns up + make into a self contained class
* Integrate scenes
* Add public mode that sets lights based on twitter streams

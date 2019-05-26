module.exports = {
  cookieSecret: 'mycookiesecret0987654321',
  mongo: {

  },
  authProviders: {
    facebook: {
      development: {
        appId: 'your_app_id',
        appSecret: 'your_app_secret',
      }
    }
  },
  twitter:{
    consumerKey:'my_twitter_key',
    consumerSecret:'my_twitter_secret',
  },
  weatherUnderground:{
    apiKey:'my_weather_api_key',
  }
}
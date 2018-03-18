import fetch from "node-fetch"; // for fetching from rest APIs

// Call to remote REST API
const FortuneCookie = {
  getOne() {
    return fetch("http://fortunecookieapi.herokuapp.com/v1/cookie")
      .then(res => res.json())
      .then(res => {
        return res[0].fortune.message;
      });
  }
};

// Call to MQTT servers
//TODO Put in here

export { FortuneCookie };

import Sequelize from "sequelize"; // for SQL Database
import casual from "casual"; // for mock data
import _ from "lodash"; // for utility
import fetch from "node-fetch"; // for fetching from rest APIs

// Create the SQLite database
const db = new Sequelize("lightapp", null, null, {
  dialect: "sqlite",
  // Since this technically gets fired from server.js, use a path relative to that
  storage: "./data/lightapp.sqlite"
});

const AuthorModel = db.define("author", {
  firstName: { type: Sequelize.STRING },
  lastName: { type: Sequelize.STRING }
});

const PostModel = db.define("post", {
  title: { type: Sequelize.STRING },
  text: { type: Sequelize.STRING },
  views: { type: Sequelize.INTEGER }
});

AuthorModel.hasMany(PostModel);
PostModel.belongsTo(AuthorModel);

// create mock data with a seed, so we always get the same
casual.seed(123);
db.sync({ force: true }).then(() => {
  _.times(10, () => {
    return AuthorModel.create({
      firstName: casual.first_name,
      lastName: casual.last_name
    }).then(author => {
      return author.createPost({
        title: `A post by ${author.firstName}`,
        text: casual.sentences(3),
        views: casual.integer(0, 1000)
      });
    });
  });
});

const Author = db.models.author;
const Post = db.models.post;

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

export { Author, Post, FortuneCookie };

import Sequelize from "sequelize";
import "sqlite3";

const db = new Sequelize("lights", null, null, {
  dialect: "sqlite",
  storage: "./database/lights.sqlite"
});

const LightModel = db.define("light", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  }
});

db.sync();

const Lights = db.models.light;

export { Lights };

/* 
      LightModel.create({
        id
      })
      LightModel.destroy({
      where: {
        id
      }})
      LightModel.findAll()

*/

import Sequelize from "sequelize";

const db = new Sequelize("lights", null, null, {
  dialect: "sqlite",
  storage: "./lights.sqlite"
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

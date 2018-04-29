import casual from "casual";

const mocks = {
  Light: () => ({
    id: () => casual.integer(0, 10),
    name: () => casual.first_name,
    power: () => casual.boolean,
    brightness: () => casual.integer(0, 100),
    hue: () => casual.integer(0, 255),
    saturation: () => casual.integer(0, 255)
  })
};

export default mocks;

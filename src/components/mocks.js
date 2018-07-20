import casual from "casual";

const mocks = {
  Light: () => ({
    id: () => casual.title,
    connected: () => 2,
    state: () => false,
    brightness: () => casual.integer(0, 100),
    color: () => {
      return {
        r: casual.integer(0, 255),
        g: casual.integer(0, 255),
        b: casual.integer(0, 255)
      };
    }
  })
};

export default mocks;

const serialize = <T>(data: unknown): T => {
  return JSON.parse(JSON.stringify(data)) as T;
};

export default serialize;

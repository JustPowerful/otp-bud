const delegate = () => {
  const methods = new Map<PropertyKey, jest.Mock>();

  return new Proxy(
    {},
    {
      get: (_, method: PropertyKey) => {
        if (!methods.has(method)) methods.set(method, jest.fn());
        return methods.get(method);
      },
    },
  );
};

const models = new Map<PropertyKey, ReturnType<typeof delegate>>();
const transaction = jest.fn((callback: (tx: unknown) => unknown) =>
  callback(prisma),
);

export const prisma = new Proxy(
  {},
  {
    get: (_, model: PropertyKey) => {
      if (model === '$transaction') return transaction;
      if (!models.has(model)) models.set(model, delegate());
      return models.get(model);
    },
  },
);

const parseType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;
  const allowedStatuses = ['in-service', 'ready', 'delivered'];
  if (allowedStatuses.includes(type)) return type;
};

const parseString = (value) => {
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
};

export const parseFilterParams = (query) => {
  const { status, brand, model } = query;

  const parsedStatus = parseType(status);
  const parsedBrand = parseString(brand);
  const parsedModel = parseString(model);

  return {
    status: parsedStatus,
    brand: parsedBrand,
    model: parsedModel,
  };
};

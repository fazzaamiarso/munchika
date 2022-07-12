const removeKeysWithNoValue = (record: Record<string, any>) => {
  let filteredRecord = {};
  for (let key in record) {
    if (record[key]) filteredRecord = { ...filteredRecord, [key]: record[key] };
  }
  return filteredRecord;
};
const createQueryString = (queryStringRecord: Record<string, string>) => {
  const filteredRecord = removeKeysWithNoValue(queryStringRecord);
  const newSearchParams = new URLSearchParams(filteredRecord);
  return newSearchParams.toString();
};

export { createQueryString };

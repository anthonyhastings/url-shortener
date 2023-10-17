export const isValidHTTPURL = (str) => {
  const urlPattern =
    /^https?:\/\/[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]$/;

  return urlPattern.test(str);
};

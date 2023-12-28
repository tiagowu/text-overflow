const validateLinks = (inputText) => {
  const allLinks = inputText.match(/\[[^\]]*\]\([^)]*\)/g) ?? [];
  const validLinks = inputText.match(/\[[^\]]*\]\((https?:\/\/[^)]*)\)/g) ?? [];
  return allLinks.length === validLinks.length;
};

export default validateLinks;

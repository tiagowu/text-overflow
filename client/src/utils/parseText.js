const parseText = (text) => {
  const regex = /\[(.*?)\]\((.*?)\)/g;
  const result = [];
  let lastIndex = 0;

  while (true) {
    const match = regex.exec(text);

    if (!match) {
      break;
    }

    result.push(
      text.substring(lastIndex, match.index),
      <a href={match[2]} key={result.length} target="_blank" rel="noreferrer" style={{ color: "blue" }}>
        {match[1]}
      </a>
    );

    lastIndex = regex.lastIndex;
  }

  result.push(text.substring(lastIndex));
  return <>{result}</>;
};

export default parseText;

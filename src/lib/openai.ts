import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw Error("OPENAI_API_KEY is not set");
}

const openai = new OpenAI({ apiKey });
const modelName = "text-embedding-3-small";
// const modelName = "text-embedding-ada-002";

export default openai;

export async function getEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: modelName,
    input: text,
  });

  const embedding = response.data[0].embedding;

  if (!embedding) throw Error("Error generating embedding.");

  console.log(embedding);

  return embedding;
}

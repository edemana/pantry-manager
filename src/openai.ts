import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Ensure your API key is stored securely
});
export const getRecipeSuggestions = async (ingredients: string[]) => {
    const prompt = `Suggest a recipe using the following ingredients: ${ingredients.join(', ')}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
  
    if (response.choices && response.choices.length > 0 && response.choices[0].message) {
      return response.choices[0].message.content.trim();
    } else {
      throw new Error('No recipe suggestion was generated.');
    }
  };
export { openai };

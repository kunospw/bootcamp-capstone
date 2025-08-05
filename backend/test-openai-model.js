import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing OpenAI model and JSON format support...');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
console.log('Model being used:', model);

// Check model support for JSON format
function modelSupportsJsonFormat(model) {
  const supportedModels = [
    'gpt-4-turbo-preview',
    'gpt-4-turbo',
    'gpt-4-1106-preview',
    'gpt-4-0125-preview',
    'gpt-3.5-turbo-1106',
    'gpt-3.5-turbo-0125',
    'gpt-3.5-turbo-16k-0613'
  ];
  
  return supportedModels.some(supportedModel => 
    model.includes(supportedModel) || model.startsWith(supportedModel)
  );
}

const supportsJson = modelSupportsJsonFormat(model);
console.log('Model supports JSON format:', supportsJson);

// Test a simple API call
async function testAPICall() {
  try {
    const requestParams = {
      model: model,
      messages: [
        {
          role: 'user',
          content: 'Respond with a simple JSON object containing {"test": "success", "model": "' + model + '"}'
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    };
    
    // Only add response_format if model supports it
    if (supportsJson) {
      requestParams.response_format = { type: 'json_object' };
      console.log('Added JSON response format to request');
    } else {
      console.log('Model does not support JSON format, sending without response_format');
    }
    
    console.log('Making API call...');
    const response = await client.chat.completions.create(requestParams);
    
    console.log('API Response:');
    console.log('- Model used:', response.model);
    console.log('- Content:', response.choices[0]?.message?.content);
    console.log('- Usage:', response.usage);
    
  } catch (error) {
    console.error('API call failed:', error.message);
    if (error.error) {
      console.error('Error details:', error.error);
    }
  }
}

testAPICall();

// Add Deno namespace declaration for TypeScript
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createMistral } from 'npm:@ai-sdk/mistral';
import { z } from 'npm:zod';
import { tool, streamText } from 'npm:ai';

// Field definitions for each appointment type (from fields.ts)
const appointmentFields: Record<string, string[]> = {
  unwell: [
    'What is the complaint?',
    'How long has it been going on?',
    'Has it been getting worse?',
    'Previous health issues?',
  ],
  infection: [
    'What symptoms do you have?',
    'When did the symptoms start?',
    'Have you had a fever?',
    'Have you been in contact with sick people?',
  ],
  'sick-note': [
    'What illness or condition requires a sick note?',
    'How long do you need the sick note for?',
    'Is this for a physical or psychological reason?',
  ],
  prescription: [
    'Which medication or treatment do you need a prescription for?',
    'Have you used this medication before?',
    'Are there any allergies or side effects?',
  ],
  referral: [
    'Which specialist or examination do you need a referral for?',
    'What is the reason for the referral?',
    'Have you seen this specialist before?',
  ],
  prevention: [
    'Which preventive check-up do you need?',
    'Do you have any specific concerns?',
    'When was your last check-up?',
  ],
  'control-lab': [
    'Which condition or lab values need to be checked?',
    'When was your last control?',
    'Are there any new symptoms?',
  ],
  'vaccination-advice': [
    'Which vaccination or advice do you need?',
    'Is this for travel or standard vaccination?',
    'Have you had any reactions to vaccines before?',
  ],
  'sexual-health': [
    'What is your concern regarding sexual health?',
    'Do you have symptoms or need a check-up?',
    'Any recent risk exposures?',
  ],
  dmp: [
    'Which chronic condition is being managed?',
    'When was your last DMP appointment?',
    'Any changes in your condition?',
  ],
  'mental-health': [
    'What mental health concern do you have?',
    'How long have you been experiencing this?',
    'Have you received treatment before?',
  ],
  other: [
    'What is the reason for your visit?',
    'Is this a special consultation?',
    'Any additional information?',
  ],
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client, accept',
  'Access-Control-Max-Age': '86400',
};
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}
function addCorsHeaders(response: Response) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const apiKey = Deno.env.get('MISTRAL_API_KEY');
    if (!apiKey) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({
            error: 'Mistral API key not configured',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }
    const ai = createMistral({ apiKey });

    // Parse the request body
    const requestData = await req.text();
    let data;
    try {
      data = JSON.parse(requestData);
    } catch (parseError) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({
            error: `Invalid JSON: ${parseError.message}`,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }
    const { appointmentType, messages } = data || {};
    if (!appointmentType || !Array.isArray(messages)) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({
            error: 'Missing appointmentType or messages array',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }
    const fields = appointmentFields[appointmentType];
    if (!fields) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({
            error: `Unknown appointmentType: ${appointmentType}`,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }

    // Dynamically build zod schema for the appointment type
    const zodShape: Record<string, any> = {};
    for (const field of fields) {
      zodShape[field] = z.string().describe(field).optional();
    }
    const AppointmentSchema = z.object(zodShape);

    // Define the extraction tool
    const extractInfo = tool({
      description: `Extract as much information as possible for the following fields, based on the user's conversation. Only include fields that you can extract.`,
      parameters: AppointmentSchema,
      execute: async (params) => params,
    });

    // Compose the system prompt
    const systemPrompt = `You are an AI assistant for a medical appointment booking system. Use the extractInfo tool to return a structured JSON object with the field questions as keys and the extracted answers as values. Only include fields you can extract. Example:\n{\n  "What is the complaint?": "Headache and fever for 2 days",\n  "How long has it been going on?": "2 days"\n}`;

    // Call the AI model with the tool
    let result;
    try {
      result = await streamText({
        model: ai('mistral-large-latest'),
        system: systemPrompt,
        messages,
        tools: { extractInfo },
        maxTokens: 512,
        temperature: 0.2,
      });
    } catch (aiError) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({
            error: `AI processing error: ${aiError.message}`,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }

    // Parse the tool invocation result
    let extracted;
    try {
      // The result will be a stream, so we need to collect the final output
      const reader = result.toReadableStream().getReader();
      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += value;
      }
      // Try to parse as JSON
      extracted = JSON.parse(fullText);
    } catch (parseError) {
      return addCorsHeaders(
        new Response(
          JSON.stringify({
            error: 'Could not parse AI response as JSON',
            raw: result,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }
    return addCorsHeaders(
      new Response(JSON.stringify(extracted), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  } catch (error) {
    return addCorsHeaders(
      new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
  }
});

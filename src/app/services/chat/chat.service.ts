import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AbstractApiService } from '../supabase.service';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService extends AbstractApiService {
  /**
   * Get AI response from the edge function
   * @param messages Array of messages to send to the AI
   * @param onProgress Callback function for streaming updates
   * @returns Promise with the complete AI response
   */
  async getAiResponse(
    messages: Message[],
    onProgress?: (partialResponse: string) => void
  ): Promise<string> {
    // Check if messages array is empty before continuing
    if (!messages || messages.length === 0) {
      throw new Error('No messages to send to AI');
    }

    // Supabase Project and Function details
    const functionUrl = `${environment.supabaseUrl}/functions/v1/ai-chat`;

    // Get the session token
    const {
      data: { session },
    } = await this._supabase.auth.getSession();
    const accessToken = session?.access_token || '';

    // Set a timeout for the request to prevent hanging
    const timeout = 30000; // 30 seconds

    // Function to create a fetch request with timeout
    const fetchWithTimeout = (
      url: string,
      options: RequestInit,
      ms: number
    ) => {
      const controller = new AbortController();
      const { signal } = controller;

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, ms);

      return fetch(url, { ...options, signal }).finally(() =>
        clearTimeout(timeoutId)
      );
    };

    // If not streaming, use the fetch API directly
    if (!onProgress) {
      // Non-streaming response
      const response = await fetchWithTimeout(
        functionUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ messages }),
        },
        timeout
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      // Try to parse as JSON first
      let data;
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, check if this is a text response with multiple lines
        // that match the streaming format pattern
        const lines = responseText
          .split('\n')
          .filter((line) => line.trim() !== '');
        if (lines.some((line) => line.startsWith('0:'))) {
          // It seems to be using the streaming format, manually parse it
          let fullResponse = '';
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const content = line.slice(2).trim();
                const parsed = JSON.parse(content);
                if (typeof parsed === 'string') {
                  fullResponse += parsed;
                }
              } catch (parseError) {
                const match = line
                  .slice(2)
                  .trim()
                  .match(/^"(.*)"$/);
                if (match) {
                  fullResponse += match[1];
                }
              }
            }
          }
          if (fullResponse) {
            return fullResponse;
          }
        }

        // If we couldn't parse as streaming format either, return the raw text
        return responseText;
      }

      // Extract the text from the response - this depends on AI SDK response format
      if (data && typeof data === 'object') {
        if (data.text) return data.text;
        if (data.value && data.value.content) return data.value.content;
        if (data.content) return data.content;
        return JSON.stringify(data);
      }

      return data || '';
    }

    // For streaming responses, use the same URL but with streaming headers
    const response = await fetchWithTimeout(
      functionUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ messages }),
      },
      timeout
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! Status: ${response.status}, Details: ${errorText}`
      );
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported in this browser');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode and process the chunk
      const chunk = decoder.decode(value, { stream: true });

      try {
        // Process each line (each line is a separate event)
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          // Handle different line formats
          if (line.startsWith('data: ')) {
            // Process standard SSE format (data: {...})
            const jsonStr = line.slice(6);

            if (jsonStr === '[DONE]') {
              continue;
            }

            try {
              const json = JSON.parse(jsonStr);

              // Handle different formats of the streaming response
              if (json.type === 'text') {
                // AI SDK text type
                fullResponse += json.value;
                onProgress(fullResponse);
              } else if (json.type === 'data-stream' && json.data) {
                // AI SDK data-stream type
                const textData =
                  json.data.text || json.data.value || json.data.content || '';
                if (textData) {
                  fullResponse += textData;
                  onProgress(fullResponse);
                }
              } else if (json.choices && json.choices.length > 0) {
                // OpenAI direct format
                const content = json.choices[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  onProgress(fullResponse);
                }
              } else if (json.content) {
                // Another possible format
                fullResponse += json.content;
                onProgress(fullResponse);
              } else if (json.value && typeof json.value === 'string') {
                // Yet another format
                fullResponse += json.value;
                onProgress(fullResponse);
              } else if (json.text) {
                // Direct text property
                fullResponse += json.text;
                onProgress(fullResponse);
              }
            } catch (parseError) {
              // Silently ignore parse errors for streaming
            }
          } else if (line.startsWith('f:')) {
            // Message ID format - ignore
          } else if (line.startsWith('0:')) {
            // Content chunk format
            const content = line.slice(2).trim();

            // The content is in quotes, so parse it
            try {
              const parsed = JSON.parse(content);
              if (typeof parsed === 'string') {
                fullResponse += parsed;
                onProgress(fullResponse);
              }
            } catch (e) {
              // If parsing fails, try to extract the text between quotes
              const match = line
                .slice(2)
                .trim()
                .match(/^"(.*)"$/);
              if (match) {
                fullResponse += match[1];
                onProgress(fullResponse);
              }
            }
          } else if (line.startsWith('e:') || line.startsWith('d:')) {
            // End of message format - ignore
          }
        }
      } catch (e) {
        // Silently handle stream parsing errors
      }
    }

    return fullResponse;
  }
}

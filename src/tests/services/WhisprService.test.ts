// src/tests/services/WhisprService.test.ts
import axios from 'axios';
import { queryWhispr } from '../../services/WhisprService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WhisprService', () => {
  it('sends the prompt and returns the reply string', async () => {
    const prompt = 'Hello Whispr';
    mockedAxios.post.mockResolvedValueOnce({ data: { reply: 'Hi there!' } });

    const reply = await queryWhispr(prompt);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:4000/api/whispr/query',
      { prompt }
    );
    expect(reply).toBe('Hi there!');
  });

  it('throws when the HTTP request fails', async () => {
    const prompt = 'Test error';
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

    await expect(queryWhispr(prompt)).rejects.toThrow('Network error');
  });
});
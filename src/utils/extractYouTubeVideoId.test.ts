import { describe, it, expect } from 'vitest';
import { extractYouTubeVideoId } from './extractYouTubeVideoId';

describe('extractYouTubeVideoId', () => {
  it('extracts ID from standard watch URL', () => {
    const res = extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('dQw4w9WgXcQ');
    expect(res.canonicalUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('extracts ID from watch URL with query parameters and timestamps', () => {
    const res = extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s&feature=share&si=abc123');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from mobile watch URL (m.youtube.com)', () => {
    const res = extractYouTubeVideoId('https://m.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from short youtu.be URL', () => {
    const res = extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from short youtu.be URL with timestamp', () => {
    const res = extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?t=45');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from YouTube Shorts URL', () => {
    const res = extractYouTubeVideoId('https://www.youtube.com/shorts/3f7eX4K_qUo');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('3f7eX4K_qUo');
  });

  it('extracts ID from YouTube Embed URL', () => {
    const res = extractYouTubeVideoId('https://www.youtube.com/embed/9bZkp7q19f0');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('9bZkp7q19f0');
  });

  it('extracts ID from YouTube Live URL', () => {
    const res = extractYouTubeVideoId('https://www.youtube.com/live/jfKfPfyJRdk?feature=share');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('jfKfPfyJRdk');
  });

  it('extracts direct 11-character video ID', () => {
    const res = extractYouTubeVideoId('dQw4w9WgXcQ');
    expect(res.isValid).toBe(true);
    expect(res.videoId).toBe('dQw4w9WgXcQ');
  });

  it('rejects empty and whitespace inputs with friendly message', () => {
    const res = extractYouTubeVideoId('   ');
    expect(res.isValid).toBe(false);
    expect(res.videoId).toBeNull();
    expect(res.error).toBe('Please enter a YouTube video URL or ID.');
  });

  it('rejects unsupported domains with clear message', () => {
    const res = extractYouTubeVideoId('https://vimeo.com/12345678');
    expect(res.isValid).toBe(false);
    expect(res.videoId).toBeNull();
    expect(res.error).toContain('Unsupported domain');
  });

  it('rejects malformed URLs without valid video ID', () => {
    const res = extractYouTubeVideoId('https://www.youtube.com/watch?invalid=true');
    expect(res.isValid).toBe(false);
    expect(res.videoId).toBeNull();
    expect(res.error).toContain('Could not find a valid 11-character YouTube video ID');
  });
});

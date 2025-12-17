// HeyGen API Integration for MC2 Estimating
// Documentation: https://docs.heygen.com/reference/api-overview

const HEYGEN_API_URL = 'https://api.heygen.com/v2';

function getApiKey(): string {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) {
    throw new Error('HEYGEN_API_KEY environment variable is not set');
  }
  return key;
}

export interface HeyGenVideoRequest {
  script: string;
  avatarId?: string; // Optional: use specific avatar
  voiceId?: string;  // Optional: use specific voice
  title?: string;
}

export interface HeyGenVideoResponse {
  video_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
}

/**
 * Generate a video using HeyGen API
 * @param request Video generation request
 * @returns Video response with ID and status
 */
export async function generateVideo(
  request: HeyGenVideoRequest
): Promise<HeyGenVideoResponse> {
  try {
    const response = await fetch(`${HEYGEN_API_URL}/video/generate`, {
      method: 'POST',
      headers: {
        'X-Api-Key': getApiKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: request.avatarId || 'default_avatar_id',
              avatar_style: 'normal',
            },
            voice: {
              type: 'text',
              input_text: request.script,
              voice_id: request.voiceId || 'default_voice_id',
            },
          },
        ],
        dimension: {
          width: 1920,
          height: 1080,
        },
        title: request.title || 'MC2 Course Video',
        test: false, // Set to true for testing (uses watermark)
      }),
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      video_id: data.data.video_id,
      status: 'pending',
    };
  } catch (error) {
    console.error('Error generating HeyGen video:', error);
    throw error;
  }
}

/**
 * Check the status of a video
 * @param videoId Video ID from generate request
 * @returns Updated video status and URL when completed
 */
export async function getVideoStatus(
  videoId: string
): Promise<HeyGenVideoResponse> {
  try {
    const response = await fetch(`${HEYGEN_API_URL}/video/${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': getApiKey(),
      },
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      video_id: videoId,
      status: data.data.status,
      video_url: data.data.video_url,
      thumbnail_url: data.data.thumbnail_url,
      duration: data.data.duration,
    };
  } catch (error) {
    console.error('Error checking video status:', error);
    throw error;
  }
}

/**
 * List available avatars
 * @returns List of available HeyGen avatars
 */
export async function listAvatars() {
  try {
    const response = await fetch(`${HEYGEN_API_URL}/avatars`, {
      method: 'GET',
      headers: {
        'X-Api-Key': getApiKey(),
      },
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.avatars;
  } catch (error) {
    console.error('Error listing avatars:', error);
    throw error;
  }
}

/**
 * List available voices
 * @returns List of available voices
 */
export async function listVoices() {
  try {
    const response = await fetch(`${HEYGEN_API_URL}/voices`, {
      method: 'GET',
      headers: {
        'X-Api-Key': getApiKey(),
      },
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.voices;
  } catch (error) {
    console.error('Error listing voices:', error);
    throw error;
  }
}

/**
 * Poll video status until completed
 * @param videoId Video ID to poll
 * @param maxAttempts Maximum polling attempts (default 60 = 5 minutes)
 * @param intervalMs Polling interval in milliseconds (default 5000 = 5 seconds)
 * @returns Completed video response
 */
export async function waitForVideo(
  videoId: string,
  maxAttempts: number = 60,
  intervalMs: number = 5000
): Promise<HeyGenVideoResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getVideoStatus(videoId);

    if (status.status === 'completed') {
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(`Video generation failed for ${videoId}`);
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Video generation timeout for ${videoId}`);
}

// Example usage:
/*
const video = await generateVideo({
  script: "Welcome to MC2 Estimating Academy. In this course, you'll learn...",
  title: "Course Introduction",
});

// Wait for completion
const completedVideo = await waitForVideo(video.video_id);
console.log('Video ready:', completedVideo.video_url);
*/

export interface PublishResult {
  success: boolean;
  message: string;
  url?: string;
}

export const publishToGithub = async (
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string
): Promise<PublishResult> => {
  try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      
      // 1. Check if file exists (to get SHA for update)
      let sha = undefined;
      try {
          const checkRes = await fetch(apiUrl, {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/vnd.github.v3+json'
              }
          });
          if (checkRes.ok) {
              const data = await checkRes.json();
              sha = data.sha;
          }
      } catch (e) {
          // Ignore, assume new file
      }

      // 2. Create/Update File
      // Content needs to be Base64
      // We need to handle UTF-8 chars carefully
      const base64Content = btoa(unescape(encodeURIComponent(content)));

      const body: any = {
          message: `Update ${path} via Forum Generator`,
          content: base64Content,
      };
      if (sha) body.sha = sha;

      const res = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
      });

      if (!res.ok) {
          const err = await res.json();
          return { success: false, message: err.message || 'Upload failed' };
      }

      // 3. Return URL
      // success!
      // Construct Pages URL: https://<owner>.github.io/<repo>/<path>
      // Assumes Pages is enabled on root or standard logic.
      const pagesUrl = `https://${owner}.github.io/${repo}/${path}`;
      return { success: true, message: 'Published successfully!', url: pagesUrl };

  } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
  }
};

export interface PublishResult {
  success: boolean;
  message: string;
  url?: string;
  pagesEnabled?: boolean;
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

      // 3. Enable GitHub Pages if not already enabled
      let pagesEnabled = true; // Assume true unless 404
      try {
          const pagesCheck = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/vnd.github.v3+json'
              }
          });

          if (pagesCheck.status === 404) {
               pagesEnabled = false;
               // Pages not enabled, try to enable it
               const branches = ['main', 'master'];
               
               for (const branch of branches) {
                   const branchCheck = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
                       headers: {
                           'Authorization': `Bearer ${token}`,
                           'Accept': 'application/vnd.github.v3+json'
                       }
                   });
                   
                   if (branchCheck.ok) {
                       const enableRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
                           method: 'POST',
                           headers: {
                               'Authorization': `Bearer ${token}`,
                               'Accept': 'application/vnd.github.v3+json',
                               'Content-Type': 'application/json'
                           },
                           body: JSON.stringify({
                               source: {
                                   branch: branch,
                                   path: '/'
                               }
                           })
                       });
                       
                       if (enableRes.ok || enableRes.status === 409) {
                           pagesEnabled = true;
                           break;
                       }
                   }
               }
          }
      } catch (e) {
          console.warn('Error checking/enabling GitHub Pages:', e);
          // Don't set pagesEnabled to false here to avoid false alarms on network hitch, 
          // unless we are sure it failed.
      }

      // 4. Return URL
      const pagesUrl = `https://${owner}.github.io/${repo}/${path}`;
      return { 
          success: true, 
          message: 'Published successfully!', 
          url: pagesUrl,
          pagesEnabled 
      };

  } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
  }
};

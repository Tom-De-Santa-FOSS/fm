# Deployment

Gitea is the source repository; its push mirror updates `Tom-De-Santa-FOSS/fm` on GitHub. GitHub Actions runs `.github/workflows/deploy.yml` on mirrored `main` and deploys to Cloudflare. Gitea Actions does not deploy this project.

After merging, confirm that GitHub's `main` contains the merge commit and that its GitHub Actions deployment run succeeded before reporting a deployment. If GitHub is behind, inspect Gitea's push-mirror error and retry the mirror sync. A local build or Gitea merge alone does not deploy.

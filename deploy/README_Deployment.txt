=== GCP DEPLOYMENT INSTRUCTIONS ===

1. Log into Google Cloud Console
2. Open your project or create a new one
3. Enable App Engine and billing
4. Open Cloud Shell or install gcloud CLI locally

5. Navigate to your server directory:
   cd T:/TNS Website/server

6. Deploy with:
   gcloud app deploy ../deploy/app.yaml --project=[YOUR_PROJECT_ID]

7. To view the deployed site:
   gcloud app browse

=== DNS CONFIG (AFTER DEPLOYMENT) ===
1. Go to your domain registrar
2. Set an A record to point to the external IP of your deployed app
3. Or follow GCP custom domain mapping instructions

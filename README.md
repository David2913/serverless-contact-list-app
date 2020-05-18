# Serverless contact list app
Capstone project of the Udacity Cloud Developer course

## How to deploy this project?
This project is built using the Serverless Framework. If you want to deploy this project to your AWS account please follow these steps:
- Make a copy of the `.env.example` file and rename it `.env`
- Fill the `.env` file with the following configuration:
  - CONTACT_LIST_TABLE: The name of your Dynamodb contacts table
  - CONTACT_PHOTO_S3_BUCKET: The name of the S3 bucket that will store the contacts
  - AWS_SIGNED_URL_EXPIRATION: The time a signed url will be available
  - AUTH0_JWKS_URL: Your Auth0's json web token url
- Deploy your project, make sure you have appropiate AWS permissions: `sls deploy -v --aws-profile <YOUR AWS PROFILE>`

## Dependencies
- [Frontend project](https://github.com/David2913/serverless-contact-list-frontend)
- [AWS account](https://aws.amazon.com/)
- [Auth0 account](https://auth0.com/)

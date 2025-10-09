# IEMTracker

IEMTracker is a web application designed to help worship team volunteers at churches borrow, check out, and track in-ear monitors (IEMs).  
It provides a simple and secure way for team members and leaders to manage equipment availability and accountability.

---

## Overview

Many churches rely on shared in-ear monitors (IEMs) for their worship teams, but tracking who currently has which set can be difficult and if lost, costly.  
IEMTracker streamlines this process by providing a digital check-in/check-out system that integrates securely with AWS services.

---

## Features

- **Equipment Tracking** – Maintain an up-to-date list of available and borrowed IEMs.  
- **Volunteer Checkouts** – Allow users to check out and return IEMs via a web interface.  
- **Admin Oversight** – Provide administrators with full visibility of who currently has each device.  
- **Secure Authentication** – Integrated with AWS Cognito for user authentication and access control.  
- **Serverless Backend** – Built on AWS Lambda for scalable, cost-efficient operation.  
- **Persistent Storage** – DynamoDB is used to store IEM, user, and checkout data.

---


## Architecture

IEMTracker is built using a fully serverless architecture on AWS:

| Component | Service | Description |
|------------|----------|-------------|
| Authentication | **Amazon Cognito** | Handles user registration, login, and secure access control. |
| API Layer | **AWS Lambda** | Processes checkout and return requests through API Gateway. |
| Database | **Amazon DynamoDB** | Stores IEM inventory, users, and checkout logs. |
| Authorization | **AWS IAM** | Defines roles and permissions for secure resource access. |
| Hosting | **GitHub Pages** | Hosts the frontend application. |

---

## Tech Stack

| Category | Technology |
|-----------|-------------|
| Frontend | JavaScript / React / Vite (builds) |
| Backend | AWS Lambda (Node.js runtime) |
| Database | Amazon DynamoDB |
| Authentication | Amazon Cognito |
| Infrastructure | AWS IAM, API Gateway |
| Deployment | GitHub Actions |

---

## Getting Started

### Prerequisites
- Node.js v18 or later  
- An AWS account with access to Lambda, DynamoDB, and Cognito  
- AWS CLI configured with appropriate IAM permissions  

### Installation
```bash
git clone https://github.com/IIVioletKingII/IEMTracker.git
cd IEMTracker
npm install
```

---

## Environment Configuration

For the router to route urls locally and once deployed you can add the local and deployed urls in `.env` and `.env.production` respectively.

.env
```
VITE_PUBLIC_URI="http://localhost:5173/IEMTracker"
```

---

## Run Locally

You can simulate API Gateway and Lambda locally using AWS SAM CLI:
```
npm run dev
```

Then open http://localhost:5173/IEMTracker in your browser to test the frontend.



---

## Deployment

Configure environment variables in AWS Lambda and Cognito.

Build and deploy the frontend (if separate):
```bash
npm run predeploy
npm run deploy
```


---

## Folder Structure
```pgsql
IEMTracker/
│
├── public/
│   ├── NL-IEM-Tracker.png
│   ├── NL-logo.png
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── css/
│   ├── images/
│   ├── pages/
│   |── main.tsx
│   └── Router.tsx
│
|── package.json
|── tsconfig.json.json
|── vite.config.ts
└── README.md
```

## 404 Redirect (GH Pages)

This app uses a trick to redirect to the home page if GitHub pages redirects you to the error.
This integrates nicely using a router in react.

Find more [here](404.html)

---

## Security

AWS Cognito enforces user authentication.

IAM roles restrict Lambda and DynamoDB access by least privilege.

All API requests require authenticated user tokens.

DynamoDB tables are encrypted at rest.

---

## License

MIT License © 2025 [Sam DePoule](https://github.com/IIVioletKingII)

---

## Author

Sam DePoule
Creator and developer of IEMTracker
[GitHub](https://github.com/IIVioletKingII) | [LinkedIn](https://www.linkedin.com/in/sam-depoule/)

---

## Motivation

This project was built to improve how church worship teams manage shared IEMs, reducing confusion and lost equipment while maintaining accountability and trust among volunteers.
It demonstrates the practical use of AWS’s serverless ecosystem to solve real-world organizational challenges.

---

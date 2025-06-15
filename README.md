This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## LLM Prompts
The goal of this project is to generate web applications using the Next js (App router),(javascript ESM) , Tailwind, Firebase stack. AI tools such as RAG (Retrieval-Augmented Generation) and LLMs (Large Language Models) can be used to enhance the development process, automate content generation, and improve user experience through an API driven system. We will start out with a GUI basic website generator and incrementally add modules such as e-commerce, crm, dashboard etc. The end goal is to develop the project into an agentic system that can quickly generate a full Next.js javascript application with Firebase integration, including authentication, database, and hosting setup, using AI tools to streamline the process. We should be able to go from a simple template to a fully functional application that can be deployed and used in production environments in a day or less. Start off with a basic approach and gradually add features and complexity as needed. Page generation must be in JSX format, and the application should be designed to be easily extendable with additional features and functionalities. 


Add a setup and config section that we be displayed after installation , to setup firebase database, seed database, choose payment gateway, and other configurations required for the application to function correctly. This setup should be user-friendly and guide users through the necessary steps to get their application up and running. All matters for setup and configuration for a newly generated site will be handled from this section, ensuring that users can easily configure their applications without needing to dive into the codebase.

Use type module (esm - import or export syntax) for all JavaScript files to ensure compatibility with modern JavaScript standards and enable features like tree shaking and better module resolution. This will help in optimizing the application for performance and maintainability.

### Platforms
- **Next.js 13+**: For building the web application.
- **Firebase**: For backend services including authentication, database, and hosting.
- **JavaScript**: For building the frontend application.
- **Tailwind CSS**: For styling the application.
- **Python**: For prototyping AI models and data processing.
- **Jupyter Notebooks**: For experimenting with AI models and data analysis.
- **GitHub**: For version control and collaboration.
- **Nginx**: For serving the application in production.
- **AI Tools**: For enhancing the application with features like RAG and LLMs.
- **API-Driven Architecture**: For integrating various AI services and data sources.

- **Linux**: For deployment and hosting.

### Steps to Achieve the Goal
1. **Use GitHub Templates**: Use an existing GitHub Next JS template repository to allow users to easily create new projects based on this template. The template should include all necessary configurations for Next.js and Firebase integration.
2. **Retrieval-Augmented Generation (RAG)**: Implement RAG techniques to enhance the application with AI-driven content generation. This can include generating dynamic content based on user interactions or external data sources. The system must be API-driven to allow for flexible integration with various LLMs,AI services and data sources.
3. **Large Language Models (LLMs)**: Integrate LLMs to provide advanced features such as natural language processing, content generation, and user interaction enhancements. This can include chatbots, content summarization, or personalized recommendations based on user behavior.
4. **Agentic System Development**: Gradually evolve the application into an agentic system that can autonomously generate and manage Next.js applications with Firebase integration, leveraging AI tools for automation and optimization.
5. **Documentation and Tutorials**: Provide comprehensive documentation and tutorials to help users understand how to use the template, integrate AI tools, and develop their applications effectively.

6. **Deployment and Hosting**: Set up deployment pipelines using Linux, Nginx, NPM to ensure the application is production-ready. This includes configuring the server, optimizing performance, and ensuring security best practices are followed.
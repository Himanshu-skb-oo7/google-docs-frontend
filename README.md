# Collaborative Text Editor using SlateJS

This is a collaborative text editor application built using SlateJS. It allows multiple users to edit a document in real-time, similar to Google Docs.

## Features

- Real-time collaboration: Multiple users can edit the same document simultaneously, with changes reflected instantly.
- Formatting options: Users can apply formatting such as bold, italic, underline, and code to the text.
- Version history: Document versions are saved, allowing users to track changes and revert to previous versions.
- WebSocket communication: The application uses WebSocket for real-time communication between users.
- User identification: Each user's changes are identified by their user ID.

## Technologies Used

- React.js: Frontend UI library
- SlateJS: Rich text editing framework
- WebSocket: Real-time communication
- Axios: HTTP requests
- React Router: Routing within the application

## Getting Started

1. Clone the repository: `git clone https://github.com/Himanshu-skb-oo7/google-docs-frontend.git`
2. Navigate to the project directory: `cd google-docs-frontend`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Open your browser and go to `http://localhost:3000` to access the application.

## How to Use

1. Open the application in multiple browser tabs or devices to simulate multiple users.
2. Create a new document or join an existing document by entering its ID.
3. Edit the document collaboratively in real-time. Apply formatting using the toolbar options.
4. Changes made by each user are highlighted with their respective color.

## Future Enhancements

- Document sharing: Allow users to share document links for easy collaboration.
- Additional formatting options: Expand formatting options to include headings, lists, and more.
- Improved UI/UX: Enhance the user interface for a smoother editing experience.

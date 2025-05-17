Ignore the ./backend folder, unless explicitly asked about it.
The backend is a REST API written in Node.js It is a monorepo with the frontend and backend in the same repository. The frontend is in the frontend folder, and the backend is in the backend folder.


The website is coded using Astro.js without any additional javascript framework.
Styling is done with tailwind. The website is a static website. Mainly use tailwind utility classes, custom css is used only when necessary.

Content is stored in markdown files in the frontend\src\content folder. This is a website about a LARP event, so the content is mainly about the event, the rules, and the lore of the event. 
The content structure is defined frontend\public\config.yml, which is a DecapCMS config file. 
We are using DecapCMS, so when modifying or adding anything to the structure of the content files, we also need to modify the config.yml.
Create the necessary content files in the frontend\src\content folder, and also modify the config.yml file to reflect the changes.
The website is a static website, so there is no need to worry about server-side rendering or client-side routing.

We use single quotes for strings in JavaScript and TypeScript files, and double quotes for HTML attributes.
We do not use semicolons at the end of lines in JavaScript and TypeScript files.
We use 2 spaces for indentation in JavaScript and TypeScript files.
Use as few comments as possible, and only when necessary.
Use typesafe code, and use TypeScript types when possible.

In agent mode you can verify the build with the command "npm run build".
Ignore the ./backend folder unless explicitly asked about it.
The backend is a REST API written in Node.js. This is a monorepo with both frontend and backend in the same repository. The frontend is in the frontend folder, and the backend is in the backend folder.

The website uses Astro.js without any additional JavaScript frameworks.
Styling is done with Tailwind CSS. Use Tailwind utility classes primarily; only use custom CSS when necessary.
The website is static. Do not implement server-side rendering or client-side routing.

Content is stored as markdown files in the frontend\src\content folder. The site is about a LARP event, so content covers the event, rules, and lore.
The content structure is defined in frontend\public\config.yml (DecapCMS config).
When modifying or adding content structure, always update config.yml accordingly.
Create or update markdown files in frontend\src\content as needed, and reflect changes in config.yml.

JavaScript and TypeScript files:
- Use single quotes for strings.
- Do not use semicolons at line ends.
- Use 2 spaces for indentation.
- Write typesafe code and use TypeScript types where possible.
- Minimize comments; only add them when necessary.

HTML files:
- Use double quotes for attribute values.

Be concise. When showing code changes, use comments only when the code is not self explenatory.

To verify the build, use: cd frontend; npm run build
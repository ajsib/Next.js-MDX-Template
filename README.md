# Next.js MDX Template

## Features
1. Use `.mdx` files as pages (`page.mdx` instead of `page.tsx`).
2. Import `.mdx` files into other pages/components.
3. Statically built `/docs` from MDX.

## Usage
```bash
npm install
npm run dev
````

* Place `.mdx` in `pages/` to create routes.
* Import MDX anywhere:

  ```jsx
  import Doc from '../docs/example.mdx'
  ```
* Add docs to `/docs` for static build.

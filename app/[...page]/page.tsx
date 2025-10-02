// Example file structure, app/[...page]/page.tsx
// You could alternatively use src/app/[...page]/page.tsx
import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "../../components/builder";

// Replace with your Public API Key
builder.init('181fcc004a5c4a69aa3e354da9c845a6');

interface PageProps {
  params: Promise<{
    page: string[];
  }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const model = "poliacredita-front";
  const content = await builder
    // Get the page content from Builder with the specified options
    .get("page", {
      fetchOptions: { next: { revalidate: 5 } },
      userAttributes: {
        // Use the page path specified in the URL to fetch the content
        urlPath: "/" + (params?.page?.join("/") || ""),
      },
      // Set prerender to false to return JSON instead of HTML
      prerender: false,
    })
    // Convert the result to a promise
    .toPromise();

  return (
    <>
      {/* Render the Builder page */}
      <RenderBuilderContent content={content} model={model} />
    </>
  );
}
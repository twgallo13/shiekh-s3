export default async function ChangelogPage() {
  const html = await renderChangelog();
  return (
    <main className="container mx-auto px-4 py-8 prose prose-sm sm:prose">
      <h1>Changelog</h1>
      <div 
        className="changelog-content"
        dangerouslySetInnerHTML={{ __html: html }} 
        suppressHydrationWarning={true}
      />
    </main>
  );
}

async function renderChangelog(): Promise<string> {
  try {
    // Read the markdown at build/request time (server-side)
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.resolve(process.cwd(), "src/content/CHANGELOG.md");
    const md = await fs.readFile(filePath, "utf8");
    return simpleMarkdownToHtml(md);
  } catch (error) {
    console.error("Failed to read changelog:", error);
    return "<p>Changelog not available.</p>";
  }
}

/** Minimal markdown -> HTML (no external deps)
 * Supports:
 *  - h2 (## ), h3 (### )
 *  - unordered lists (- )
 *  - paragraphs (plain text)
 *  - code fences (``` ... ```)
 * NOTE: intentionally conservative to avoid XSS; only escapes raw text content.
 */
function simpleMarkdownToHtml(md: string): string {
  // Escape HTML
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // Handle code fences first
  let inCode = false;
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let listOpen = false;

  const endList = () => {
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };

  for (let raw of lines) {
    const line = raw.trimEnd();

    // code block fences
    if (/^```/.test(line)) {
      endList();
      if (!inCode) {
        inCode = true;
        out.push("<pre><code>");
      } else {
        inCode = false;
        out.push("</code></pre>");
      }
      continue;
    }

    if (inCode) {
      out.push(esc(raw));
      continue;
    }

    // headings
    if (line.startsWith("### ")) {
      endList();
      out.push(`<h3>${esc(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      endList();
      out.push(`<h2>${esc(line.slice(3))}</h2>`);
      continue;
    }

    // list items
    if (line.startsWith("- ")) {
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      out.push(`<li>${esc(line.slice(2))}</li>`);
      continue;
    }

    // blank line
    if (line === "") {
      endList();
      out.push("");
      continue;
    }

    // paragraph
    endList();
    out.push(`<p>${esc(line)}</p>`);
  }
  endList();

  // join with newlines so <pre> keeps spacing
  const result = out.join("\n");
  // Ensure consistent output to avoid hydration mismatches
  return result.replace(/\n{3,}/g, "\n\n");
}
# PDF Studio: A Free PDF Editor for Mac That Never Uploads Your Files

**PDF Studio is a free, open-source desktop app for Mac that compresses, merges, organizes, signs, and converts PDFs — entirely on your own computer, with no account, no subscription, and no file ever touching the internet.** If you've ever paid $20/month for Adobe Acrobat just to compress a PDF, or hesitated before uploading a signed contract to a random website, this was built for you. Get it free at [github.com/quizzito/pdf-studio](https://github.com/quizzito/pdf-studio).

## WHY: The hidden cost of "free" PDF tools

Here's a question worth asking the next time you need to shrink a PDF before emailing it: where does that file actually go?

If you use Smallpdf, iLovePDF, or any of the dozen PDF websites that rank on Google, the answer is someone else's server. You upload your file, their software processes it, and you download the result — assuming you haven't hit a daily limit or a paywall first. For a grocery list, that's a non-issue. For a signed lease, a tax return, a medical record, or a client contract, it's a quiet trade-off most people never think to question.

The other "solution" is Adobe Acrobat, which does keep things closer to home but charges roughly $20 a month for the privilege — a subscription that, over a few years, costs more than most people's laptops.

Neither option should be the only choice for something as basic as combining two PDFs or rotating a page.

<!-- TODO: insert hero screenshot of the PDF Studio app window here, e.g. ![PDF Studio app window](screenshot-home.png) -->

## WHAT: A PDF toolkit that runs entirely on your Mac

PDF Studio is a native Mac app that bundles nine of the most commonly needed PDF tools into one free, local program:

- **Compress PDF** — shrink file size by up to 80% with three quality presets
- **Combine PDFs** — merge multiple files into one
- **Organize Pages** — drag to reorder, rotate, or delete pages with live thumbnails
- **PDF to Word** — convert a PDF into a fully editable `.docx`
- **Word to PDF** — turn a `.docx` into a PDF instantly
- **JPG to PDF** — combine one or more photos into a PDF
- **HEIC to PDF** — convert iPhone photos straight to PDF, no format conversion needed first
- **PPT to PDF** — turn PowerPoint slides into a PDF
- **Add Signature** — draw, type, or upload a signature and stamp it onto any page

That covers the vast majority of what people actually do with PDFs day to day — without a subscription, a usage cap, or a server in between.

The key design decision is what PDF Studio *doesn't* do: it doesn't create an account for you, it doesn't ask for a credit card, and it doesn't send your files anywhere. Every conversion, compression, and signature happens locally, using the same open-source engines (Ghostscript and LibreOffice) that professional tools rely on — just bundled directly into the app so you never have to install or configure them yourself.

It's also fully open source. The entire codebase is public on GitHub, which means anyone can verify exactly what the app does with their files — not just take a privacy policy's word for it.

<!-- TODO: insert screenshot of a specific tool in use here, e.g. the Compress PDF or Organize Pages screen ![PDF Studio compress tool](screenshot-compress.png) -->

## HOW: Get PDF Studio running in three steps

No Terminal, no developer tools, no Python install. If you can install any normal Mac app, you can install this.

1. **[Download the latest PDF Studio.dmg](https://github.com/quizzito/pdf-studio/releases/latest)** from GitHub
2. **Open the file** and drag **PDF Studio** into your **Applications** folder
3. **Launch PDF Studio** from Launchpad, exactly like any other app

That's the whole installation. Ghostscript and LibreOffice are already packaged inside the app, so there's nothing else to download.

One thing you will see on first launch: macOS will say *"PDF Studio can't be opened because it is from an unidentified developer."* This isn't a red flag — it simply means the app wasn't signed with a paid $99/year Apple Developer certificate, the way a free, independent project usually isn't. To get past it once: **right-click the app → Open → Open**. macOS won't ask again after that.

From there, every tool lives behind a single, simple home screen — pick what you need, drop in your file, and you're done.

## WHAT IF: Common questions before you install

**Is PDF Studio actually free, with no catch?**
Yes. There's no premium tier, no file-size cap, no daily limit, and no account wall. It's free because it's open source — anyone can read the code at [github.com/quizzito/pdf-studio](https://github.com/quizzito/pdf-studio).

**Is it safe to open an app that's "from an unidentified developer"?**
That warning is standard for any Mac app not distributed through the App Store or signed with a paid Apple certificate — it's not specific to PDF Studio, and it doesn't mean the app is unsafe. Because the project is open source, you (or anyone) can inspect exactly what the code does before running it, which is more transparency than most paid PDF tools offer.

**Does any of my file data get uploaded anywhere?**
No. Every tool — compression, conversion, signing — runs as a local process on your own Mac. There's no network call involved in processing your files, which is the entire point of building it this way.

**What if PDF Studio doesn't have a tool I need?**
The roadmap already includes splitting PDFs, password protection, page numbering, and OCR, and it's open source, so anyone can request a feature or contribute code directly on GitHub.

**Does it work on Windows or Linux?**
Not yet — the packaged app is currently macOS-only. The underlying Flask app can be run from source on other platforms by developers, with setup instructions in the GitHub repo.

**Why build this instead of just using what's already out there?**
Because the existing options force a choice between paying a recurring fee or uploading personal documents to a stranger's server — and a basic task like merging two PDFs shouldn't require either.

## Get started now

PDF Studio is live, free, and ready to download right now. The fastest way to start is the [GitHub releases page](https://github.com/quizzito/pdf-studio/releases/latest), where the `.dmg` installer is a direct download — no sign-up, no email required.

If you want to see exactly how it works under the hood, browse the full source at [github.com/quizzito/pdf-studio](https://github.com/quizzito/pdf-studio). Star the repo if it saves you from another $20/month subscription — it helps other people find a free alternative, too.

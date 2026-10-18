# Awareness framework research

Checked on 18 October 2026 against the projects' own repositories, documentation, and release pages. These are options for a later sign-in exercise; none is installed in this migration.

## Recommendation for this project

Use a small, clearly labeled, fictional static sign-in demonstration on GitHub Pages if the purpose is simply to teach what a suspicious sign-in request looks like. Use fixed demonstration values and a simulated submit action, then show the existing warning and educational notes. Do not ask relatives to type real passwords, one-time codes, or recovery codes. Recording a simulated interaction needs only an event flag, never a field value.

Email links continue to open the preserved warning page directly. A sign-in page is not inserted into that flow by this migration.

| Project | What it offers | Fit here | Hosting |
| --- | --- | --- | --- |
| [Gophish](https://github.com/gophish/gophish) | Email templates, custom landing pages, campaign reporting | An established campaign framework if a separate server is later wanted. The latest official release returned by GitHub is v0.12.1, published 14 September 2022, so review maintenance and dependencies before selecting it. Configure a training exercise without submitted-field or password capture. | Separate server required; not a GitHub Pages package. |
| [Phishing Club](https://github.com/phishingclub/phishingclub) | Campaign management plus awareness training and completion reporting | A broader option for a future managed training setup. Release v1.41.0 includes awareness campaigns and dedicated reports. This is more infrastructure than a three-recipient family exercise needs. Use only the training features relevant to the exercise. | Separate backend/container deployment required. |
| [Phishing Club template workbench](https://github.com/phishingclub/templates) | Local template editing, previews, and template export | Useful as a local authoring tool for fictional templates. Its own README explicitly says not to expose the workbench publicly. It is not a hosted campaign dashboard. | Local development only; static exported assets can be reviewed separately. |

## Primary references

- [Gophish README](https://github.com/gophish/gophish/blob/master/README.md)
- [Gophish latest-release API](https://api.github.com/repos/gophish/gophish/releases/latest)
- [Gophish v0.12.1 release](https://github.com/gophish/gophish/releases/tag/v0.12.1)
- [Phishing Club README](https://github.com/phishingclub/phishingclub)
- [Phishing Club releases](https://github.com/phishingclub/phishingclub/releases)
- [Template workbench README and local-only warning](https://github.com/phishingclub/templates)
- [GitHub Pages static hosting limitations](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## Decision left for a future change

Choose between a simple static demonstration and a separately hosted campaign framework before implementing a sign-in flow. Preserve the current warning page as the debrief in either case. No credential-capture, session interception, or third-party sign-in impersonation is part of this implementation.

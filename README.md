# UNI RESIDENTIA

**Built for the Driven.**

The public Uni Residentia student accommodation website for Bloemfontein, Free State, South Africa, presenting Willows House, Universitas House, room options, amenities, enquiries and applications.

## Public website

- `index.html` — Homepage
- `residences.html`, `residence-detail.html` — Residences
- `experience.html` — Student life and gallery
- `investment.html` — Room types and rates
- `apply.html` — Application form
- `contact.html` — Enquiry and viewing requests
- `about.html`, `faq.html`, `blog.html` — Information
- `privacy.html`, `terms.html` — Policies

Styles live in `css/style.css` and `css/launch.css`. Frontend code lives in `js/launch.js`. Assets live in `images/`.

The website is hosted on GitHub Pages and sends applications and enquiries to Supabase, with database row-level security. Never expose a service-role key in public code.

## Separate Student Portal app

The Student Portal is **not part of this public website**. Its authentication, dashboard, and student-account functionality belong in a future, separately deployed application. Do not add portal links or portal JavaScript back to the public site. The public application and enquiry forms remain here; backend records are unaffected.

## Local use

Run `python3 -m http.server 8000` in the repository folder and open `http://localhost:8000`. Backend requests require internet access.

## Brand

Burgundy, heritage gold, ivory, the Uni Residentia heraldic crest, Cormorant Garamond, and Montserrat. Gallery imagery is illustrative, and room finishes may vary.

**Proprietary.** © 2026 UNI RESIDENTIA.

## Public sitemap (November 2026)
The primary navigation is **Home → WhatsApp → Locations → Contact → Apply**.
Locations: Willows, Universitas, Brandwag, Wesdene (all Bloemfontein); each has a separate page with single and sharing room options.
Contact includes phone/callback request, email enquiry, office visit request, WhatsApp and About.
The public applications form uses the existing Supabase \`ur_applications\` table with all four residence codes.
WhatsApp group invitations and direct chats use the existing contact intake until the business supplies the official group invitation URL and telephone number. Do not invent numbers.
The separate admin/resident application must authenticate admins and use restricted permissions to access the same database. It is not part of the public site.

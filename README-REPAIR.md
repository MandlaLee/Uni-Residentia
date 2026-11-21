# Site Readiness Repairs

This branch replaces misleading simulated form submissions and portal authentication with genuine Supabase-ready operations, fixes missing assets and broken internal links, and adds placeholders labelled as concepts (not real residence photos).

## Secure database setup
1. Create a **dedicated UNI RESIDENTIA** Supabase project. The connected CHOVHA project is unrelated and was not touched.
2. Run `supabase/schema.sql` in that dedicated project and check the security advisors.
3. Configure `js/config.js` using the project URL and its **publishable** key, never a service role or secret key.
4. Set the Auth Site URL, allow redirect URLs and require email verification. Configure bot protection and rate limits.
5. Test two separate users. Only the owner must be able to view an application; no one should be able to edit another user's application.
6. Replace conceptual illustrations with verified property photos; obtain approved rental terms and a full POPIA policy before launch.
7. Review real residence availability, rental rates, all property claims and payment procedures.

Until configuration, the application form and portal remain explicitly unavailable instead of returning fake success. The contact form opens an email draft; it does not claim delivery.

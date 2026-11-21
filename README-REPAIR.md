# Site Readiness Repairs

This branch replaces misleading simulated form submissions and portal authentication with genuine Supabase-ready operations, fixes missing assets and broken internal links, and adds placeholders labelled as concepts (not real residence photos).

## Secure database setup
1. The existing CHOVHA project (ref `cinpqzwltwmuzqjpazju`) was explicitly repurposed for UNI RESIDENTIA on 22 November 2026. Legacy NA​TIS application tables and private identity data were removed; platform-managed Auth/Storage infrastructure and two empty legacy Storage buckets remain.
2. The applications schema in `supabase/schema.sql` has been applied to that project. Security advisors reported no findings after the migration.
3. The project's URL and **publishable** key are configured in `js/config.js`. Never use a service-role or secret key in browser code.
4. Set the Auth Site URL, allow redirect URLs and require email verification. Configure bot protection and rate limits.
5. Test two separate users. Only the owner must be able to view an application; no one should be able to edit another user's application.
6. Replace conceptual illustrations with verified property photos; obtain approved rental terms and a full POPIA policy before launch.
7. Review real residence availability, rental rates, all property claims and payment procedures.

Until configuration, the application form and portal remain explicitly unavailable instead of returning fake success. The contact form opens an email draft; it does not claim delivery.

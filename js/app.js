/* Real authentication and application storage. No simulated submission/login. */
(() => {
 "use strict";
 const cfg=window.UNI_RESIDENTIA_CONFIG||{};
 const db=cfg.supabaseUrl&&cfg.supabasePublishableKey&&window.supabase
   ? window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey) : null;
 const get=id=>document.getElementById(id);
 const message=(id,text,kind="")=>{const el=get(id);if(el){el.textContent=text;el.dataset.kind=kind;}};
 const fail=e=>e&&e.message?e.message:"Please try again.";
 document.addEventListener("DOMContentLoaded",async()=>{
   const application=get("applicationForm");
   if(application){
     if(!db) message("applicationStatus","Online applications are not enabled until a secure database is configured. Nothing is being submitted.","error");
     else {
       const {data:{user}}=await db.auth.getUser();
       if(!user) message("applicationStatus","Please create an account or sign in to the Student Portal before applying.");
       else if(get("email")) get("email").value=user.email||"";
     }
     application.addEventListener("submit",async e=>{
       e.preventDefault();
       if(!application.reportValidity())return;
       if(!db)return message("applicationStatus","This application form is not connected. No data has been sent.","error");
       const button=application.querySelector('button[type="submit"]');
       button.disabled=true;
       try{
         const {data:{user},error:authError}=await db.auth.getUser();
         if(authError)throw authError;
         if(!user) return message("applicationStatus","Sign in using Student Portal first. Your form was not submitted.","error");
         const form=new FormData(application);
         const email=String(form.get("email")||"").trim().toLowerCase();
         if(email!==String(user.email||"").toLowerCase())return message("applicationStatus","Application email must match your signed-in account.","error");
         if(!form.has("terms"))return message("applicationStatus","Accept the application declaration.","error");
         message("applicationStatus","Submitting securely...");
         const {data,error}=await db.from("applications").insert({
           user_id:user.id,
           first_name:String(form.get("firstName")||"").trim(),
           last_name:String(form.get("lastName")||"").trim(),
           email,
           phone:String(form.get("phone")||"").trim(),
           university:String(form.get("university")||""),
           student_number:String(form.get("studentNumber")||"").trim(),
           study_year:String(form.get("studyYear")||""),
           residence:String(form.get("residence")||""),
           room_type:String(form.get("roomType")||"")
         }).select("id").single();
         if(error)throw error;
         message("applicationStatus","Application received. Reference: "+data.id+". You can view the status in your Student Portal.","success");
         application.reset();
       }catch(err){message("applicationStatus","Your application could not be submitted: "+fail(err),"error");}
       finally{button.disabled=false;}
     });
   }
   const contact=get("contactForm");
   if(contact)contact.addEventListener("submit",e=>{
     e.preventDefault();
     if(!contact.reportValidity())return;
     const f=new FormData(contact);
     const subject="UNI RESIDENTIA enquiry: "+String(f.get("contactSubject")||"General");
     const body="Name: "+String(f.get("contactName")||"")+
       "\nReply to: "+String(f.get("contactEmail")||"")+
       "\nTopic: "+String(f.get("contactSubject")||"")+
       "\n\n"+String(f.get("contactMessage")||"");
     message("contactStatus","Opening your email application. You must press Send there to deliver the message.");
     window.location.href="mailto:info@uniresidentia.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
   });
   const loginForm=get("loginForm"),panel=get("portalLogin"),dashboard=get("portalDashboard");
   if(!loginForm||!panel||!dashboard)return;
   const submit=loginForm.querySelector('button[type="submit"]'),signup=get("portalSignup");
   const show=async user=>{
     panel.style.display="none";
     dashboard.style.display="grid";
     const welcome=dashboard.querySelector("h2");
     if(welcome)welcome.textContent="My Student Account";
     const cards=dashboard.querySelectorAll(".portal-card");
     const info=cards.length?cards[0].querySelectorAll("p"):[];
     if(info[0])info[0].textContent="No application submitted.";
     if(info[1])info[1].textContent="Complete an application to see its status.";
     try{
       const {data,error}=await db.from("applications").select("id,residence,room_type,status,created_at")
         .eq("user_id",user.id).order("created_at",{ascending:false}).limit(1);
       if(error)throw error;
       if(data&&data.length){
         if(info[0])info[0].textContent="Application "+data[0].id.slice(0,8)+" — "+data[0].status;
         if(info[1])info[1].textContent=data[0].residence+" / "+data[0].room_type+" (requested)";
       }
     }catch(err){if(info[0])info[0].textContent="Application status unavailable";if(info[1])info[1].textContent=fail(err);}
   };
   if(!db){
     submit.disabled=true;if(signup)signup.disabled=true;
     message("portalStatus","Student sign-in is unavailable until the secure database is connected. No demo login is permitted.","error");
     return;
   }
   const {data:{user:existing}}=await db.auth.getUser();
   if(existing)await show(existing);
   db.auth.onAuthStateChange((type,session)=>{
     if(type==="SIGNED_OUT"){dashboard.style.display="none";panel.style.display="block";}
     else if(type==="SIGNED_IN"&&session?.user)setTimeout(()=>show(session.user),0);
   });
   loginForm.addEventListener("submit",async e=>{
     e.preventDefault();if(!loginForm.reportValidity())return;
     submit.disabled=true;
     message("portalStatus","Signing in...");
     try{
       const {data,error}=await db.auth.signInWithPassword({email:get("portalEmail").value.trim(),password:get("portalPassword").value});
       if(error)throw error;
       if(data.user)await show(data.user);
     }catch(err){message("portalStatus",fail(err),"error");}
     finally{submit.disabled=false;}
   });
   if(signup)signup.addEventListener("click",async()=>{
     if(!loginForm.reportValidity())return;
     signup.disabled=true;message("portalStatus","Creating account...");
     try{
       const {data,error}=await db.auth.signUp({email:get("portalEmail").value.trim(),password:get("portalPassword").value});
       if(error)throw error;
       if(data.session&&data.user)await show(data.user);
       else message("portalStatus","Please verify your account using the email confirmation link, then sign in.","success");
     }catch(err){message("portalStatus",fail(err),"error");}
     finally{signup.disabled=false;}
   });
   dashboard.querySelectorAll(".portal__nav-link--logout").forEach(a=>a.addEventListener("click",async e=>{
     e.preventDefault();await db.auth.signOut();loginForm.reset();
     panel.style.display="block";dashboard.style.display="none";
     message("portalStatus","You have signed out.");
   }));
 });
})();
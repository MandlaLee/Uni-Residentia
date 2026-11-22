"use strict";
const UR_API = "https://cinpqzwltwmuzqjpazju.supabase.co";
const UR_KEY = "sb_publishable_2QJbiuQOSsrayG7LdpFsPg_hQbhN9A3";
const $ = (sel, root=document) => root.querySelector(sel);
const pretty = v => ({willows:"Willows House",universitas:"Universitas House",either:"Any residence",single:"Single Room",sharing:"Sharing Room"}[v] || v || "—");
document.addEventListener("DOMContentLoaded", () => {
  const navbar = $("#navbar");
  const nav = $("#navMenu"), toggle = $("#mobileToggle");
  if (toggle && nav) {
    const close = () => {nav.classList.remove("is-open");toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-label","Open menu");};
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded",String(open));
      toggle.setAttribute("aria-label",open?"Close menu":"Open menu");
    });
    nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",close));
    document.addEventListener("keydown",event=>{if(event.key==="Escape")close();});
  }
  if(navbar) navbar.classList.add("navbar--scrolled");
  const params = new URLSearchParams(window.location.search);
  const residence = $("#residence"), room = $("#roomType");
  if(residence && ["willows","universitas","either"].includes(params.get("residence"))) residence.value=params.get("residence");
  if(room && ["single","sharing","either"].includes(params.get("room"))) room.value=params.get("room");
  const setStatus = (node,msg,success=false) => {
    if(!node)return;
    node.textContent=msg;
    node.classList.toggle("is-success",success);
  };
  async function submitRecord(table,record) {
    const response=await fetch(UR_API+"/rest/v1/"+table,{
      method:"POST",
      headers:{"Content-Type":"application/json","apikey":UR_KEY,"Prefer":"return=minimal"},
      body:JSON.stringify(record)
    });
    if(!response.ok) {
      let detail;
      try{const e=await response.json();detail=e?.message;}catch{}
      throw new Error(detail && response.status<500 ? detail : "The service couldn't save your submission. Please try again.");
    }
    return true;
  }
  const application = $("#applicationForm");
  if(application) application.addEventListener("submit",async e=>{
    e.preventDefault();if(!application.reportValidity())return;
    const state=$("#applicationStatus"), btn=$('button[type="submit"]',application);
    const f=new FormData(application);
    if((f.get("website")||"").trim())return;
    const payload={
      first_name:String(f.get("firstName")||"").trim(),last_name:String(f.get("lastName")||"").trim(),
      email:String(f.get("email")||"").trim().toLowerCase(),phone:String(f.get("phone")||"").trim(),
      institution:String(f.get("institution")||"").trim(),
      student_number:String(f.get("studentNumber")||"").trim()||null,
      study_year:String(f.get("studyYear")||"").trim()||null,
      residence:String(f.get("residence")||""),room_type:String(f.get("roomType")||""),
      academic_year:Number(f.get("academicYear")||2027),
      message:String(f.get("message")||"").trim()
    };
    btn.disabled=true;setStatus(state,"Sending your application securely…");
    try{
      await submitRecord("ur_applications",payload);
      setStatus(state,"Your application was received successfully. Please check your email for any follow-up from the Uni Residentia team.",true);
      application.reset();
    }catch(error){
      setStatus(state,error?.message || "Couldn't submit your application. Please retry.");
    }finally{btn.disabled=false;}
  });
  const contact=$("#contactForm");
  if(contact)contact.addEventListener("submit",async e=>{
    e.preventDefault();if(!contact.reportValidity())return;
    const f=new FormData(contact),btn=$('button[type="submit"]',contact),state=$("#contactStatus");
    if((f.get("website")||"").trim())return;
    const payload={name:String(f.get("name")||"").trim(),email:String(f.get("email")||"").trim().toLowerCase(),subject:String(f.get("subject")||""),message:String(f.get("message")||"").trim()};
    btn.disabled=true;setStatus(state,"Sending your message…");
    try{
      await submitRecord("ur_messages",payload);
      setStatus(state,"Your message was received. The Uni Residentia team can review it in their secure inbox.",true);
      contact.reset();
    }catch(error){setStatus(state,error?.message||"Couldn't send your message. Please try again.");}
    finally{btn.disabled=false;}
  });
  if($("#portalLoginForm"))setupPortal(setStatus);
});
async function setupPortal(setStatus) {
  const state=$("#portalStatus"),login=$("#portalLoginForm"),loginPanel=$("#portalSignIn"),dashboard=$("#portalDashboard"),out=$("#portalSignOut"),data=$("#portalApplications");
  let client;
  try{
    const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/+esm");
    client=createClient(UR_API,UR_KEY,{auth:{persistSession:true,detectSessionInUrl:true,autoRefreshToken:true}});
  }catch{
    setStatus(state,"The sign-in service could not load. Check your connection and retry.");return;
  }
  const render=async()=>{
    try{
      const {data:session,error}=await client.auth.getSession();
      if(error)throw error;
      const user=session.session?.user;
      loginPanel.hidden=!!user;dashboard.hidden=!user;
      if(!user){data.replaceChildren();return;}
      $("#portalEmail").textContent=user.email||"Your account";
      setStatus(state,"Retrieving your applications…");
      const r=await client.from("ur_applications").select("created_at,residence,room_type,academic_year,status").order("created_at",{ascending:false});
      if(r.error)throw r.error;
      data.replaceChildren();
      if(!r.data?.length){
        const p=document.createElement("p");p.textContent="No applications are linked to this email yet. If you recently applied with a different email, please contact our team.";data.appendChild(p);
      }else{
        r.data.forEach(row=>{
          const box=document.createElement("div");box.className="ur-app-row";
          const title=document.createElement("strong");title.textContent=pretty(row.residence)+" · "+pretty(row.room_type);
          const detail=document.createElement("small");detail.textContent="Academic year "+row.academic_year+" · Status: "+row.status+" · Submitted "+new Date(row.created_at).toLocaleDateString("en-ZA");
          box.append(title,detail);data.appendChild(box);
        });
      }
      setStatus(state,"");
    }catch(err){setStatus(state,err?.message||"Unable to load your applications.");}
  };
  login.addEventListener("submit",async e=>{
    e.preventDefault();if(!login.reportValidity())return;
    const btn=$('button[type="submit"]',login),email=String(new FormData(login).get("email")||"").trim();
    btn.disabled=true;setStatus(state,"Sending sign-in link…");
    try{
      const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+window.location.pathname,shouldCreateUser:true}});
      if(error)throw error;
      setStatus(state,"Check your email for your sign-in link. Open it to view your applications.",true);
    }catch(err){setStatus(state,err?.message||"We couldn't send a link. Please try again.");}
    finally{btn.disabled=false;}
  });
  if(out)out.addEventListener("click",async()=>{await client.auth.signOut();setStatus(state,"Signed out.",true);await render();});
  client.auth.onAuthStateChange((_event,_session)=>{setTimeout(()=>render(),0);});
  await render();
}
